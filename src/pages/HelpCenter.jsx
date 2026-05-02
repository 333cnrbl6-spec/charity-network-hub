import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare } from 'lucide-react';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const { data: articles = [] } = useQuery({
    queryKey: ['help-articles'],
    queryFn: () => base44.entities.HelpArticle.filter({ published: true })
  });

  const categories = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'billing', label: 'Billing & Plans' },
    { id: 'security', label: 'Security' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'faq', label: 'FAQ' }
  ];

  const filtered = articles.filter(a => {
    const matchesCategory = a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground">Find answers and get support</p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4 mb-12">
          {filtered.length > 0 ? (
            filtered.map(article => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {article.content.substring(0, 150)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {article.view_count} views
                    </span>
                    <Button variant="ghost" size="sm">Read Article →</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground mb-4">No articles found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Support */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <MessageSquare className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is here to help. Contact us for faster assistance.
                </p>
                <Button className="gap-2">Contact Support</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}