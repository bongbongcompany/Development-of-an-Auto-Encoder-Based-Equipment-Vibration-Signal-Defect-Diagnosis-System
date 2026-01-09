# 03_score_sklearn.py
import os, csv, json
import numpy as np

NPZ = r"D:\Vibe\data_proc\dataset.npz"
MODEL = r"D:\Vibe\models\ae_sklearn.npz"
THR = r"D:\Vibe\models\threshold.json"
OUT_CASE = r"D:\Vibe\models\scores_by_case.csv"

def mlp_predict(X, coefs, intercepts):
    h = X
    for W, b in zip(coefs[:-1], intercepts[:-1]):
        h = np.maximum(0, h @ W + b)
    return h @ coefs[-1] + intercepts[-1]

def main():
    data = np.load(NPZ, allow_pickle=True)
    X = data["X"].astype(np.float32)
    case_id = data["case_id"].astype(np.int32)

    mdl = np.load(MODEL, allow_pickle=True)
    coefs = mdl["coefs"]
    intercepts = mdl["intercepts"]

    with open(THR, "r", encoding="utf-8") as f:
        thr = json.load(f)["threshold"]

    recon = mlp_predict(X, coefs, intercepts)
    err = np.mean((recon - X) ** 2, axis=1)

    rows = []
    for cid in sorted(np.unique(case_id)):
        e = err[case_id == cid]
        rows.append({
            "case_id": int(cid),
            "case_name": f"Case{cid+1}",
            "windows": int(len(e)),
            "err_mean": float(e.mean()),
            "err_p95": float(np.percentile(e, 95)),
            "err_p99": float(np.percentile(e, 99)),
            "is_anomaly": int(np.percentile(e, 95) > thr)
        })

    rows.sort(key=lambda r: r["err_p95"], reverse=True)

    os.makedirs(os.path.dirname(OUT_CASE), exist_ok=True)
    with open(OUT_CASE, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)

    print("Saved:", OUT_CASE)
    print("Top suspicious cases:")
    for r in rows[:5]:
        print(r)

if __name__ == "__main__":
    main()
