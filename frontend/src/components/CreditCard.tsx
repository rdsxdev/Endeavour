import { useState } from "react";
import { api } from "../api";

export default function CreateCredit() {
  const [project, setProject] = useState("");
  const [country, setCountry] = useState("");
  const [vintage, setVintage] = useState("");

  async function submit() {
    const res = await api.post("/credits", {
      project,
      country,
      vintage_year: Number(vintage),
    });

    alert(`Created!\n${res.data.tx_hash}`);
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Carbon Credit</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "400px",
        }}
      >
        <input
          placeholder="Project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />

        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          placeholder="Vintage Year"
          value={vintage}
          onChange={(e) => setVintage(e.target.value)}
        />

        <button onClick={submit}>
          Create Credit
        </button>
      </div>
    </div>
  );
}