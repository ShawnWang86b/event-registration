import EventDisplay from "@/components/EventDisplay";
import { getTranslations } from "next-intl/server";

export default async function EventsPage() {
  const t = await getTranslations("EventsPage");

  return (
    <div className="min-h-screen min-w-[90vw] lg:min-w-[80vw] lg:w-auto p-0 pt-10 lg:p-16">
      <h1 className="text-lg lg:text-3xl font-bold text-foreground">
        {t("title")}
      </h1>
      <p className="text-primary text-sm lg:text-lg mt-2">{t("subtitle")}</p>

      <EventDisplay />
    </div>
  );
}
