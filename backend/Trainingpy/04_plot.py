# 04_plot.py
import os
import pandas as pd
import matplotlib.pyplot as plt

INP = r"D:\Vibe\models\scores_by_case.csv"
OUT = r"D:\Vibe\models\case_p95.png"

def main():
    df = pd.read_csv(INP)
    df = df.sort_values("case_id")

    plt.figure()
    plt.bar(df["case_name"], df["err_p95"])
    plt.xticks(rotation=45, ha="right")
    plt.ylabel("Reconstruction error (p95)")
    plt.tight_layout()

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    plt.savefig(OUT, dpi=200)
    print("Saved:", OUT)

if __name__ == "__main__":
    main()
