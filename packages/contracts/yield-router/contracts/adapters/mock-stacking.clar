;; Mock stacking adapter implementing the shared yield-adapter trait
;; Simulates a downstream protocol that keeps 5% of deposits as fees.

(impl-trait .router.yield-adapter)

(define-constant FEE-BPS u2) ;; 2%

(define-public (deposit
    (amount uint)
    (sender principal)
  )
  (let (
      (fee (/ (* amount FEE-BPS) u100))
      (net (if (> amount fee)
        (- amount fee)
        u0
      ))
    )
    (ok { out: net })
  )
)
