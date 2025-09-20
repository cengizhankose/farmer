;; title: router
;; version: 1.1.0
;; summary: Yield aggregator router contract
;; description: Routes SIP-010 tokens through protocol adapters with safety guards

;; constants
(define-constant ERR-NOT-AUTH (err u100))
(define-constant ERR-NOT-ALLOWED (err u101))
(define-constant ERR-PAUSED (err u200))
(define-constant ERR-INVALID-AMOUNT (err u201))
(define-constant ERR-AMOUNT-TOO-HIGH (err u202))
(define-constant ERR-TRANSFER-FAILED (err u300))
(define-constant ERR-ADAPTER-FAILED (err u301))
(define-constant ERR-SLIPPAGE (err u302))
(define-constant ERR-ADAPTER-MISMATCH (err u303))

;; traits
(define-trait yield-adapter
  (
    (deposit (uint principal) (response (tuple (out uint)) uint))
  )
)

(define-trait sip10-token
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
  )
)

;; data vars
(define-data-var owner principal tx-sender)
(define-data-var paused bool false)
(define-data-var per-tx-cap uint u100000000) ;; 1e8 micro-units

;; data maps
(define-map allowed-protocols {id: uint} {target: principal, adapter: principal, token: principal})

;; read only functions
(define-read-only (is-owner (who principal))
  (is-eq who (var-get owner)))

(define-read-only (is-paused)
  (var-get paused))

(define-read-only (get-tx-cap)
  (var-get per-tx-cap))

(define-read-only (is-protocol-allowed (protocol-id uint))
  (is-some (map-get? allowed-protocols {id: protocol-id})))

(define-read-only (get-protocol-config (protocol-id uint))
  (map-get? allowed-protocols {id: protocol-id}))

(define-read-only (get-protocol-token (protocol-id uint))
  (match (map-get? allowed-protocols {id: protocol-id})
    entry (some (get token entry))
    none))

;; public functions
(define-public (set-paused (p bool))
  (begin
    (asserts! (is-owner tx-sender) ERR-NOT-AUTH)
    (var-set paused p)
    (ok true)))

(define-public (set-tx-cap (cap uint))
  (begin
    (asserts! (is-owner tx-sender) ERR-NOT-AUTH)
    (var-set per-tx-cap cap)
    (ok cap)))

(define-public (allow-protocol (id uint) (target principal) (adapter principal) (token principal))
  (begin
    (asserts! (is-owner tx-sender) ERR-NOT-AUTH)
    (map-set allowed-protocols {id: id} {target: target, adapter: adapter, token: token})
    (print {
      event: "protocol-registered",
      id: id,
      target: target,
      adapter: adapter,
      token: token,
      actor: tx-sender
    })
    (ok true)))

(define-public (route-deposit (token <sip10-token>) (amount uint) (protocol-id uint) (min-out uint) (adapter <yield-adapter>))
  (begin
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount (var-get per-tx-cap)) ERR-AMOUNT-TOO-HIGH)
    (asserts! (is-protocol-allowed protocol-id) ERR-NOT-ALLOWED)

    (let ((protocol-entry (unwrap! (map-get? allowed-protocols {id: protocol-id}) ERR-NOT-ALLOWED)))
      (let (
        (adapter-principal (contract-of adapter))
        (target (get target protocol-entry))
        (expected-token (get token protocol-entry))
        (provided-token (contract-of token))
      )
        (asserts! (is-eq provided-token expected-token) ERR-ADAPTER-MISMATCH)
        (asserts! (is-eq adapter-principal (get adapter protocol-entry)) ERR-ADAPTER-MISMATCH)
        (unwrap! (contract-call? token transfer amount tx-sender adapter-principal none) ERR-TRANSFER-FAILED)

        (match (contract-call? adapter deposit amount tx-sender)
          adapter-response
            (let ((out-amount (get out adapter-response)))
              (asserts! (>= out-amount min-out) ERR-SLIPPAGE)
              (print {
                event: "route-deposit",
                token: provided-token,
                amount: amount,
                protocol-id: protocol-id,
                adapter: adapter-principal,
                target: target,
                out: out-amount,
                sender: tx-sender
              })
              (ok out-amount))
          adapter-error
            (begin
              (print {
                event: "adapter-error",
                protocol-id: protocol-id,
                adapter: adapter-principal,
                sender: tx-sender,
                code: adapter-error
              })
              ERR-ADAPTER-FAILED)))))
)
