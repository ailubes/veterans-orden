'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Phone, Globe, MapPin, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  contact: string | null;
  address: string | null;
  region: string | null;
  is_free: boolean;
}

export default function SupportResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources/support')
      .then((r) => r.json())
      .then((d) => setResources(d.resources || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center gap-1 text-xs text-muted-500 hover:text-bronze transition-colors mb-4"
        >
          <ChevronLeft size={14} /> РЕСУРСИ
        </Link>
        <p className="mono text-bronze text-xs tracking-widest mb-2">// ПСИХОЛОГІЧНА ПІДТРИМКА</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <Heart size={20} className="text-rose-400" />
          </div>
          <h1 className="font-syne text-3xl font-bold text-text-100">Психологічна підтримка</h1>
        </div>
        <p className="text-muted-500 text-sm">
          Кризові лінії, центри допомоги, групова та індивідуальна терапія для ветеранів та їхніх сімей.
        </p>
      </div>

      {/* Crisis hotline banner */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
        <Phone size={20} className="text-rose-400 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm text-text-100">Потрібна термінова допомога?</p>
          <p className="text-xs text-muted-500">Телефон довіри цілодобово: <a href="tel:1565" className="text-rose-400 font-bold">1565</a></p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-panel-900 border border-line rounded-lg animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-muted-500">
          <Heart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Наразі ресурсів немає. Перевірте пізніше.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const isUrl = resource.contact?.startsWith('http');
  const isHotline = !isUrl && resource.contact && !resource.contact.startsWith('+');

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-5 hover:border-rose-500/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-syne font-bold text-text-100 text-base leading-tight">{resource.title}</h3>
        <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${resource.is_free ? 'bg-green-500/10 text-green-400' : 'bg-bronze/10 text-bronze'}`}>
          {resource.is_free ? <><CheckCircle size={12} /> Безоплатно</> : <><XCircle size={12} /> Платно</>}
        </span>
      </div>
      {resource.description && (
        <p className="text-sm text-muted-500 mb-3 leading-relaxed">{resource.description}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {resource.region === 'national' ? (
          <span className="flex items-center gap-1 text-xs text-muted-500"><MapPin size={12} /> Вся Україна</span>
        ) : resource.region ? (
          <span className="flex items-center gap-1 text-xs text-muted-500"><MapPin size={12} /> {resource.region}</span>
        ) : null}
        {resource.contact && (
          isUrl ? (
            <a href={resource.contact} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-bronze hover:underline">
              <Globe size={12} /> Перейти на сайт
            </a>
          ) : (
            <a href={`tel:${resource.contact}`} className="flex items-center gap-1 text-xs text-rose-400 font-bold hover:underline">
              <Phone size={12} /> {resource.contact}
            </a>
          )
        )}
      </div>
    </div>
  );
}
