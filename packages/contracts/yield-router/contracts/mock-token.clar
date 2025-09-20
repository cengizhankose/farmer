;; Minimal SIP-010-compatible token surface for testing router flows

(impl-trait .router.sip10-token)

(define-map balances {owner: principal} {amount: uint})

(define-private (get-balance (owner principal))
  (match (map-get? balances {owner: owner})
    balance-entry (get amount balance-entry)
    u0))

(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (> amount u0) (err u700))
    (let ((current (get-balance recipient)))
      (map-set balances {owner: recipient} {amount: (+ current amount)})
      (ok true))))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (> amount u0) (err u701))
    (let ((sender-balance (get-balance sender)))
      (asserts! (>= sender-balance amount) (err u702))
      (map-set balances {owner: sender} {amount: (- sender-balance amount)})
      (let ((recipient-balance (get-balance recipient)))
        (map-set balances {owner: recipient} {amount: (+ recipient-balance amount)}))
      (ok true))))

(define-read-only (get-balance-of (owner principal))
  (get-balance owner))
