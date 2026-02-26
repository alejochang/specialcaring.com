import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 px-4 mt-16 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: February 26, 2026 &middot; Version 1.0
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Special Caring (&ldquo;the Service&rdquo;), you agree to be
              bound by these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
            <p>
              Special Caring is a care management platform that helps families organize essential
              care information, medical records, emergency contacts, and daily care activities for
              special-needs children. The Service is provided &ldquo;as is&rdquo; and is intended
              for informational and organizational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 18 years of age to create an account.</li>
              <li>You are responsible for all activities that occur under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Upload or transmit viruses, malware, or any harmful code.</li>
              <li>Attempt to gain unauthorized access to any part of the Service.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Share another person&rsquo;s data without their explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Ownership</h2>
            <p>
              You retain full ownership of all data you enter into the Service. We do not claim
              any intellectual property rights over your content. You may export or delete your
              data at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">6. Care Team Sharing</h2>
            <p>
              When you invite care team members to access a child&rsquo;s profile, you grant them
              access to the data associated with that profile at the permission level you specify
              (caregiver or viewer). You are responsible for managing these access permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">7. Medical Disclaimer</h2>
            <p>
              The Service is not a substitute for professional medical advice, diagnosis, or
              treatment. Always seek the advice of qualified health providers with any questions
              you may have regarding a medical condition. Never disregard professional medical
              advice or delay in seeking it because of information stored in the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Special Caring and its operators shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the Service, including but not
              limited to loss of data, errors in stored information, or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">9. Termination</h2>
            <p>
              You may terminate your account at any time from your Profile page. We reserve the
              right to suspend or terminate accounts that violate these Terms. Upon termination,
              your data will be permanently deleted in accordance with our{" "}
              <a href="/privacy" className="text-special-600 hover:underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify users of material
              changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
              Continued use of the Service after changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">11. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us
              at <a href="mailto:support@specialcaring.com" className="text-special-600 hover:underline">support@specialcaring.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
