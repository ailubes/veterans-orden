'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Loader2, MapPin, Building2, Users, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Job = {
  id: string;
  post_id?: string | null;
  title: string;
  company_name?: string | null;
  location?: string | null;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'project' | 'internship';
  salary_min?: number | null;
  salary_max?: number | null;
  application_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  description: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
};

type Access = {
  canPost: boolean;
  reason: string | null;
  referralCount: number;
  membershipTier: string | null;
  membershipPaidUntil: string | null;
};

type JobsResponse = {
  jobs: Job[];
  access: Access;
};

const employmentOptions = [
  { value: 'full_time', label: 'Повна зайнятість' },
  { value: 'part_time', label: 'Часткова зайнятість' },
  { value: 'contract', label: 'Контракт' },
  { value: 'project', label: 'Проєктна робота' },
  { value: 'internship', label: 'Стажування' },
] as const;

export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<Job['employment_type']>('full_time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');

  const canSubmit = useMemo(() => {
    return !!title.trim() && !!description.trim() && !!access?.canPost;
  }, [title, description, access?.canPost]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = (await response.json()) as JobsResponse;
      setJobs(data.jobs || []);
      setAccess(data.access || null);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити вакансії',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setCompanyName('');
    setLocation('');
    setEmploymentType('full_time');
    setSalaryMin('');
    setSalaryMax('');
    setApplicationUrl('');
    setContactEmail('');
    setContactPhone('');
    setDescription('');
    setVisibility('public');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          company_name: companyName.trim() || null,
          location: location.trim() || null,
          employment_type: employmentType,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          application_url: applicationUrl.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          description: description.trim(),
          visibility,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      setJobs((prev) => [data.job as Job, ...prev]);
      resetForm();
      toast({
        title: 'Вакансію опубліковано',
        description: 'Оголошення з’явилось у стрічці та на сторінці Робота',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося опублікувати вакансію',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Робота</h1>
          <p className="text-sm text-muted-foreground">Вакансії спільноти. Обговорення відбувається у стрічці.</p>
        </div>
      </div>

      {access && !access.canPost && (
        <div className="rounded-lg border bg-card p-4 text-sm space-y-1">
          <p className="font-medium">Публікація вакансій наразі недоступна</p>
          <p className="text-muted-foreground">{access.reason || 'Потрібне право публікації'}</p>
          <p className="text-muted-foreground">Запрошено учасників: {access.referralCount}/3</p>
        </div>
      )}

      {access?.canPost && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="font-semibold">Додати вакансію</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Назва вакансії" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Компанія" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Input placeholder="Локація" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as Job['employment_type'])}>
              <SelectTrigger>
                <SelectValue placeholder="Тип зайнятості" />
              </SelectTrigger>
              <SelectContent>
                {employmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Зарплата від"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              type="number"
              min="0"
            />
            <Input
              placeholder="Зарплата до"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              type="number"
              min="0"
            />
            <Input placeholder="Посилання на відгук" value={applicationUrl} onChange={(e) => setApplicationUrl(e.target.value)} />
            <Input placeholder="Email для звʼязку" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <Input placeholder="Телефон для звʼязку" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'followers' | 'private')}>
              <SelectTrigger>
                <SelectValue placeholder="Видимість у стрічці" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Публічно</SelectItem>
                <SelectItem value="followers">Для підписників</SelectItem>
                <SelectItem value="private">Приватно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Опис вакансії"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
          />

          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Опублікувати вакансію
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold">Актуальні вакансії</h2>

        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Поки що вакансій немає
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="rounded-lg border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.author.display_name}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString('uk-UA')}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {job.company_name ? (
                  <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.company_name}</span>
                ) : null}
                {job.location ? (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                ) : null}
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {employmentOptions.find((o) => o.value === job.employment_type)?.label}</span>
              </div>

              <p className="text-sm whitespace-pre-wrap">{job.description}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {job.application_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Відгукнутись
                    </a>
                  </Button>
                ) : null}

                {job.post_id ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/post/${job.post_id}`} className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Обговорення в стрічці
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
