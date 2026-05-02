import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: May 2, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Information We Collect</h2>
              <p>CharityHub collects information you provide directly to us when you create an account, including:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Name, email address, and organization details</li>
                <li>Payment and billing information (processed by Stripe)</li>
                <li>Usage data and analytics</li>
                <li>Communications you send us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Data Protection & GDPR</h2>
              <p>CharityHub complies with GDPR and UK data protection laws. You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Restrict processing of your data</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact privacy@charityhub.io</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Data Sharing</h2>
              <p>We do not sell or share your personal data with third parties. We may share data only:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>With service providers who assist in our operations (e.g., Stripe for payments)</li>
                <li>When required by law or court order</li>
                <li>To protect the rights, privacy, safety, or property of CharityHub</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Cookies</h2>
              <p>CharityHub uses cookies to enhance your experience. You can control cookie settings through your browser. Essential cookies for authentication cannot be disabled.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Data Retention</h2>
              <p>We retain your data for as long as your account is active. You may request deletion at any time, except where we are required to retain data for legal or compliance reasons.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Security</h2>
              <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
              <p>We may update this privacy policy periodically. We will notify you of significant changes via email.</p>
            </section>

            <section className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                For privacy inquiries, contact privacy@charityhub.io
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}