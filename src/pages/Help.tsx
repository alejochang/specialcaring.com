import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqKeys = [
  "addChild",
  "inviteCaregiver",
  "dataSecure",
  "exportData",
  "deleteAccount",
  "languages",
  "mobileApp",
];

const Help = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 px-4 mt-16 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{t("pages.help.title")}</h1>
        <p className="text-muted-foreground mb-10">
          {t("pages.help.subtitle")}
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{t("pages.help.faqTitle")}</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqKeys.map((key, i) => (
              <AccordionItem key={key} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{t(`pages.help.faqs.${key}.q`)}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{t(`pages.help.faqs.${key}.a`)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t("pages.help.stillNeedHelp")}</h2>
          <p className="text-muted-foreground">
            {t("pages.help.contactUs")}
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              {t("pages.help.emailLabel")}{" "}
              <a href="mailto:support@specialcaring.com" className="text-special-600 hover:underline">
                support@specialcaring.com
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
