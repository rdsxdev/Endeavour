type Props = {
  title: string;
  value: number;
};

export default function StatCard({
  title,
  value,
}: Props) {
  return (
    <div
      style={{
        background: "#131a2e",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #24324d",
      }}
    >
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}