(define-read-only (min-out-breach)
  (let ((result (contract-call? .router route-deposit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-token u1000 u1 u950 .mock-adapter)))
    (if (is-err result) (get err result) (err u999))))
