import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: May 2, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p>By accessing and using CharityHub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on CharityHub for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Disclaimer</h2>
              <p>The materials on CharityHub are provided on an 'as is' basis. CharityHub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Limitations</h2>
              <p>In no event shall CharityHub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform, even if CharityHub or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Accuracy of Materials</h2>
              <p>The materials appearing on CharityHub could include technical, typographical, or photographic errors. CharityHub does not warrant that any of the materials on its platform are accurate, complete, or current. CharityHub may make changes to the materials contained on its platform at any time without notice.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Links</h2>
              <p>CharityHub has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by CharityHub of the site. Use of any such linked website is at the user's own risk.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Modifications</h2>
              <p>CharityHub may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of England and Wales, and you irrevocably submit to the exclusive jurisdiction of the courts located in England and Wales.</p>
            </section>

            <section className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                For inquiries about these terms, please contact support@charityhub.io
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}