import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export default function Flags({ country }: { country: string }) {
  if (!country) return null;

  const code = countries.getAlpha2Code(country, "en");

  if (!code) return null;

  return (
    <img
      src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
      alt={country}
      className="inline h-4 ml-[2px] align-middle"
    />
  );
}