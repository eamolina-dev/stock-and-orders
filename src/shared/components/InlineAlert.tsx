type Props = {
  tone: "success" | "error";
  message: string;
};

export function InlineAlert({ tone, message }: Props) {
  const styles =
    tone === "success"
      ? "bg-emerald-500 text-white"
      : "bg-red-500 text-white";

  return <div className={`${styles} px-3 py-2 rounded-md text-sm`}>{message}</div>;
}
