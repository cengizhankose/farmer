;; Mock adapter implementing the router yield-adapter trait for testing

(impl-trait .router.yield-adapter)

(define-data-var should-fail bool false)
(define-data-var skim-ratio uint u0) ;; percentage out of 100

(define-public (set-failure (flag bool))
  (begin
    (var-set should-fail flag)
    (ok flag)))

(define-public (set-skim-ratio (ratio uint))
  (begin
    (var-set skim-ratio ratio)
    (ok ratio)))

(define-read-only (get-config)
  {
    should-fail: (var-get should-fail),
    skim-ratio: (var-get skim-ratio)
  })

(define-public (deposit (amount uint) (sender principal))
  (begin
    (if (var-get should-fail)
      (err u900)
      (let (
        (ratio (var-get skim-ratio))
        (deduction (/ (* amount ratio) u100))
        (adjusted (if (> amount deduction) (- amount deduction) u0))
      )
        (ok {out: adjusted})))))
