from fastapi import FastAPI


app = FastAPI(title="Intelligent TCM Consultation System")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
