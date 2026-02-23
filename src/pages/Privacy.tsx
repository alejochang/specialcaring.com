import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-16 px-4 mt-16 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: February 23, 2026 &middot; Version 1.0
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p>
              Special Caring collects only the information strictly necessary to provide care
              coordination services. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information (email address, name)</li>
              <li>Child profile data you provide (medical information, contacts, care notes)</li>
              <li>Usage data needed for the service to function</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Protect Your Data</h2>
            <p>
              We take the security of your child&rsquo;s data extremely seriously:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Encryption at rest:</strong> Sensitive fields (phone numbers, addresses,
                medical conditions, health card numbers, and more) are encrypted in our database
                so that even database administrators cannot read them.
              </li>
              <li>
                <strong>Row-Level Security:</strong> Every database table is protected with
                access policies ensuring only authorized caregivers can view or modify data.
              </li>
              <li>
                <strong>Audit logging:</strong> All data modifications are logged for
                accountability.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Minimization</h2>
            <p>
              We only store what is strictly necessary for care coordination. When you export
              your data, internal system identifiers are stripped so only meaningful care
              information is included.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Portability</h2>
            <p>
              You can export all of your child&rsquo;s care data at any time in PDF, CSV, or
              JSON format from your dashboard. This ensures you can take your data with you if
              you move to a different provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">5. Right to Erasure</h2>
            <p>
              You can delete your account and all associated data at any time from your Profile
              page. This action is irreversible and will permanently remove all children
              profiles, care records, and your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">6. Children&rsquo;s Privacy (COPPA)</h2>
            <p>
              Special Caring is designed for use by parents and caregivers of children. We do
              not collect information directly from children. All data is entered and managed
              by authorized adult caregivers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">7. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal data with third parties. Data is
              only shared with care team members you explicitly invite to your child&rsquo;s
              profile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this privacy policy or your data, please contact us
              at <a href="mailto:privacy@specialcaring.com" className="text-special-600 hover:underline">privacy@specialcaring.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
