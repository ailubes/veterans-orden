'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Phone, Globe, MapPin, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  contact: string | null;
  address: string | null;
  region: string | null;
  is_free: boolean;
}

export default function JobsResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources/jobs')
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
        <p className="mono text-bronze text-xs tracking-widest mb-2">// ЗАЙНЯТІСТЬ</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Briefcase size={20} className="text-blue-400" />
          </div>
          <h1 className="font-syne text-3xl font-bold text-text-100">Зайнятість</h1>
        </div>
        <p className="text-muted-500 text-sm">
          Вакансії, програми перекваліфікації та підтримка підприємців-ветеранів.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-panel-900 border border-line rounded-lg animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-muted-500">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
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
  const isPhone = resource.contact?.startsWith('+') || resource.contact?.startsWith('0');

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-5 hover:border-bronze/30 transition-colors">
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
        {resource.region && resource.region !== 'national' && (
          <span className="flex items-center gap-1 text-xs text-muted-500">
            <MapPin size={12} /> {resource.region}
          </span>
        )}
        {resource.region === 'national' && (
          <span className="flex items-center gap-1 text-xs text-muted-500">
            <MapPin size={12} /> Вся Україна
          </span>
        )}
        {resource.contact && (
          isUrl ? (
            <a
              href={resource.contact}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-bronze hover:underline"
            >
              <Globe size={12} /> Перейти на сайт
            </a>
          ) : (
            <a
              href={`tel:${resource.contact}`}
              className="flex items-center gap-1 text-xs text-bronze hover:underline"
            >
              <Phone size={12} /> {resource.contact}
            </a>
          )
        )}
      </div>
    </div>
  );
}
