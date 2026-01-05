'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, MapPin, Users, UserCog } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Oblast {
  id: string;
  code: string;
  name: string;
  member_count: number;
  regional_leaders: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }[];
}

export default function OblastsManagementTab() {
  const [loading, setLoading] = useState(true);
  const [oblasts, setOblasts] = useState<Oblast[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    fetchOblasts();
  }, []);

  async function fetchOblasts() {
    try {
      const response = await fetch('/api/admin/settings/oblasts');
      if (!response.ok) throw new Error('Failed to fetch oblasts');
      const data = await response.json();
      setOblasts(data.oblasts);
      setTotalMembers(data.totalMembers);
    } catch (error) {
      console.error('Error fetching oblasts:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити області',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />
        <Loader2 className="w-8 h-8 animate-spin text-bronze" />
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
      {/* Joints */}
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="mb-6">
        <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Управління областями</h2>
        <p className="text-muted-500 text-sm">
          Адміністративні одиниці України з кількістю членів та регіональними лідерами
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="border border-line rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-500 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Всього областей</span>
          </div>
          <p className="font-syne text-2xl font-bold">{oblasts.length}</p>
        </div>

        <div className="border border-line rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Всього членів</span>
          </div>
          <p className="font-syne text-2xl font-bold">{totalMembers}</p>
        </div>

        <div className="border border-line rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-500 mb-1">
            <UserCog className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Середньо на область</span>
          </div>
          <p className="font-syne text-2xl font-bold">
            {oblasts.length > 0 ? Math.round(totalMembers / oblasts.length) : 0}
          </p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {oblasts.length === 0 ? (
          <div className="text-center text-muted-500 py-8 border border-line rounded-lg">
            Немає даних про області
          </div>
        ) : (
          oblasts
            .sort((a, b) => b.member_count - a.member_count)
            .map((oblast) => (
              <div
                key={oblast.id}
                className="border border-line rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold">{oblast.name}</h3>
                    <p className="text-xs text-muted-500 font-mono">{oblast.code}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-panel-850/10 text-sm font-bold">
                    <Users className="w-4 h-4" />
                    {oblast.member_count}
                  </span>
                </div>
                <div className="pt-2 border-t border-line/10">
                  <p className="text-xs text-muted-500 mb-1">Регіональні лідери:</p>
                  {oblast.regional_leaders.length === 0 ? (
                    <span className="text-sm text-muted-500">Немає</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {oblast.regional_leaders.map((leader) => (
                        <span
                          key={leader.id}
                          className="text-xs border border-bronze/30 px-2 py-1"
                        >
                          {leader.first_name} {leader.last_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-line rounded-lg overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow className="border-b-2 border-line hover:bg-transparent">
              <TableHead className="font-syne font-bold">Код</TableHead>
              <TableHead className="font-syne font-bold">Назва</TableHead>
              <TableHead className="font-syne font-bold">Членів</TableHead>
              <TableHead className="font-syne font-bold">Регіональні лідери</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oblasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-500 py-8">
                  Немає даних про області
                </TableCell>
              </TableRow>
            ) : (
              oblasts
                .sort((a, b) => b.member_count - a.member_count)
                .map((oblast) => (
                  <TableRow key={oblast.id} className="border-b border-bronze/30">
                    <TableCell className="font-mono text-sm text-muted-500">
                      {oblast.code}
                    </TableCell>
                    <TableCell className="font-medium">{oblast.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-500" />
                        <span className="font-bold">{oblast.member_count}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      {oblast.regional_leaders.length === 0 ? (
                        <span className="text-sm text-muted-500">Немає</span>
                      ) : (
                        <div className="space-y-1">
                          {oblast.regional_leaders.map((leader) => (
                            <div
                              key={leader.id}
                              className="text-sm border border-bronze/30 px-2 py-1 inline-block mr-1 mb-1"
                            >
                              {leader.first_name} {leader.last_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 border-2 border-bronze bg-panel-900/50">
        <p className="text-sm text-muted-500">
          <strong>Примітка:</strong> Області є фіксованими адміністративними одиницями України.
          Редагування назв областей наразі не підтримується. Регіональні лідери призначаються
          через вкладку &quot;Ролі&quot;.
        </p>
      </div>
    </div>
  );
}
