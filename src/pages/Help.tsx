import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I add a child profile?",
    a: "After signing in, click the \"Add Child\" button on your dashboard. Fill in your child's name and any other details you'd like to track. You can always update this information later.",
  },
  {
    q: "How do I invite a caregiver to my child's profile?",
    a: "Go to your child's dashboard and open the Care Team section. Click \"Invite Member,\" enter their email address, and choose a role (caregiver or viewer). They'll receive an invite code to join.",
  },
  {
    q: "Is my child's data secure?",
    a: "Yes. Sensitive fields like phone numbers, addresses, and medical information are encrypted at rest. Every table is protected with Row-Level Security policies so only authorized caregivers can access the data. See our Privacy Policy for full details.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. You can export your child's care data in PDF, CSV, or JSON format from the relevant dashboard sections. Exported files contain only meaningful care information — internal system identifiers are stripped.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to your Profile page and scroll to the bottom. Click \"Delete Account\" — this will permanently remove your account and all associated children profiles and care records. This action cannot be undone.",
  },
  {
    q: "What languages are supported?",
    a: "Special Caring currently supports English (Canada), French (Canada), and Spanish. You can switch languages using the language selector in the navigation bar.",
  },
  {
    q: "Is there a mobile app?",
    a: "Special Caring is a progressive web app (PWA). You can add it to your phone's home screen from your browser for an app-like experience — no app store download required.",
  },
];

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 px-4 mt-16 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Help &amp; Support</h1>
        <p className="text-muted-foreground mb-10">
          Find answers to common questions below. If you need further assistance, don&rsquo;t
          hesitate to reach out.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Still Need Help?</h2>
          <p className="text-muted-foreground">
            Contact our support team and we&rsquo;ll get back to you as soon as possible.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              Email:{" "}
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
