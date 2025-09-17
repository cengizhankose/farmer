;; title: router
;; version: 1.0.0
;; summary: Yield aggregator router contract
;; description: Routes deposits to allowed protocols with security features

;; constants
(define-constant ERR-NOT-AUTH (err u100))
(define-constant ERR-NOT-ALLOWED (err u101))
(define-constant ERR-PAUSED (err u200))
(define-constant ERR-INVALID-AMOUNT (err u201))
(define-constant ERR-AMOUNT-TOO-HIGH (err u202))

;; data vars
(define-data-var owner principal tx-sender)
(define-data-var paused bool false)
(define-data-var per-tx-cap uint u100000000) ;; 1e8 microSTX

;; data maps
(define-map allowed-protocols {id: uint} {target: principal})

;; read only functions
(define-read-only (is-owner (who principal))
  (is-eq who (var-get owner)))

(define-read-only (is-paused)
  (var-get paused))

(define-read-only (get-tx-cap)
  (var-get per-tx-cap))

(define-read-only (is-protocol-allowed (protocol-id uint))
  (is-some (map-get? allowed-protocols {id: protocol-id})))

;; public functions
(define-public (set-paused (p bool))
  (begin
    (asserts! (is-owner tx-sender) ERR-NOT-AUTH)
    (var-set paused p)
    (ok true)))

(define-public (allow-protocol (id uint) (target principal))
  (begin
    (asserts! (is-owner tx-sender) ERR-NOT-AUTH)
    (map-set allowed-protocols {id: id} {target: target})
    (ok true)))

(define-public (route-deposit (token principal) (amount uint) (protocol-id uint) (min-out uint))
  (begin
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount (var-get per-tx-cap)) ERR-AMOUNT-TOO-HIGH)
    (asserts! (is-protocol-allowed protocol-id) ERR-NOT-ALLOWED)

    ;; Log the deposit event
    (print {
      event: "route-deposit",
      token: token,
      amount: amount,
      protocol-id: protocol-id,
      min-out: min-out,
      sender: tx-sender
    })

    (ok true)))

