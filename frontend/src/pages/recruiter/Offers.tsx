import { useState } from "react";
import { HeartHandshake, X } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { Card } from "../../components/ui/Card.js";
import { formatDate } from "../../lib/format.js";
import { useRecruiterOffers } from "../../hooks/useRecruiterOffers.js";
import { offerService } from "../../services/offerService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse } from "../../types/index.js";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function Offers(): JSX.Element {
  const { offers, isLoading, error, refetch } = useRecruiterOffers();
  const { showToast } = useToast();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (id: string): Promise<void> => {
    setWithdrawingId(id);
    try {
      await offerService.withdraw(id);
      showToast("Offer withdrawn", "info");
      refetch();
    } catch (err) {
      showToast(isApiResponse(err) ? err.message : "Unable to withdraw offer.", "error");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <AppShell title="Offers">
      <PageHeader title="Offers" description="Offers extended across your jobs." />

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<HeartHandshake className="h-5 w-5" />}
            title="No offers yet"
            description="Create an offer from a candidate's application once they're ready to hire."
          />
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
          <ul className="divide-y divide-surface-border">
            {offers.map((offer) => (
              <li key={offer.id} className="flex items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-800">
                    {offer.context?.candidate.name ?? "Candidate"}
                  </p>
                  <p className="text-xs text-navy-500">{offer.context?.job.title ?? "Job details unavailable"}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                    {offer.salary && <span>Salary: {offer.salary}</span>}
                    {offer.startDate && <span>Starts {formatDate(offer.startDate)}</span>}
                    {offer.expiryDate && <span>Expires {formatDate(offer.expiryDate)}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-navy-400">Created {formatDate(offer.createdAt)}</p>
                </div>
                <StatusBadge status={offer.status} />
                {offer.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => void handleWithdraw(offer.id)}
                    disabled={withdrawingId === offer.id}
                    aria-label="Withdraw offer"
                    className="focus-ring rounded-md p-1.5 text-navy-400 hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
