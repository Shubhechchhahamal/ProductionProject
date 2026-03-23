import Flags from "./Flags";

export default function UserName({
  name,
  country,
}: {
  name: string;
  country?: string;
}) {
  return (
    <span className="font-semibold text-gray-800">
      {name}
      {country && <Flags country={country} />}
    </span>
  );
}