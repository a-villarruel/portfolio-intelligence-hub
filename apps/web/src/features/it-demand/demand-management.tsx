'use client';

import { createApiClient } from '@pih/api-client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { components } from '../../../../../packages/api-client/src/index.js';
import styles from './demand-management.module.css';

type Demand = components['schemas']['DemandResponseDto'];
type DemandPage = components['schemas']['PaginatedDemandsResponseDto'];
type CreateDemandInput = components['schemas']['CreateDemandDto'];
type DemandField = keyof CreateDemandInput;
type FieldErrors = Partial<Record<DemandField, string>>;

const PAGE_SIZE = 20;
const EMPTY_FORM: CreateDemandInput = {
  title: '',
  description: '',
  requesterName: '',
};
const FIELD_CONFIG = {
  title: { label: 'Title', maxLength: 120 },
  description: { label: 'Description', maxLength: 4000 },
  requesterName: { label: 'Requester name', maxLength: 120 },
} satisfies Record<DemandField, { label: string; maxLength: number }>;
const FORM_FIELDS: DemandField[] = ['title', 'description', 'requesterName'];

function getApiClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be configured.');
  }

  return createApiClient(baseUrl);
}

async function getDemandPage(page: number): Promise<DemandPage> {
  const { data, response } = await getApiClient().GET('/api/demands', {
    params: { query: { page, pageSize: PAGE_SIZE } },
  });

  if (!response.ok || !data) {
    throw new Error(`Unable to load demands (HTTP ${response.status}).`);
  }

  return data;
}

function validateForm(form: CreateDemandInput): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of FORM_FIELDS) {
    const config = FIELD_CONFIG[field];
    const value = form[field].trim();

    if (!value) {
      errors[field] = `${config.label} is required.`;
    } else if (value.length > config.maxLength) {
      errors[field] = `${config.label} must be ${config.maxLength} characters or fewer.`;
    }
  }

  return errors;
}

function getErrorMessage(error: unknown, action: string): string {
  if (error instanceof Error && error.message) {
    return `${action}: ${error.message}`;
  }

  return `${action}. Please try again.`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function DemandManagement() {
  const [form, setForm] = useState<CreateDemandInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageData, setPageData] = useState<DemandPage | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPage = useCallback(async (requestedPage: number) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await getDemandPage(requestedPage);
      setPageData(result);
      setPage(result.page);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load demands'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialPage() {
      try {
        const result = await getDemandPage(1);
        if (active) {
          setPageData(result);
          setPage(result.page);
        }
      } catch (error) {
        if (active) {
          setLoadError(getErrorMessage(error, 'Could not load demands'));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialPage();

    return () => {
      active = false;
    };
  }, []);

  function updateField(field: DemandField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const updated = { ...current };
      delete updated[field];
      return updated;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError(null);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const { response } = await getApiClient().POST('/api/demands', {
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          requesterName: form.requesterName.trim(),
        },
      });

      if (!response.ok) {
        throw new Error(`The API rejected the demand (HTTP ${response.status}).`);
      }

      setForm(EMPTY_FORM);
      setFieldErrors({});
      setSuccessMessage('Demand registered successfully.');
      await loadPage(1);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not register the demand'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderDemand(demand: Demand) {
    return (
      <tr key={demand.id}>
        <th scope="row">
          <strong>{demand.title}</strong>
          <span className={styles.description}>{demand.description}</span>
        </th>
        <td>{demand.requesterName}</td>
        <td>
          <span className={styles.status}>{demand.status}</span>
        </td>
        <td>
          <time dateTime={demand.createdAt}>{formatDate(demand.createdAt)}</time>
        </td>
      </tr>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>IT demand management</p>
        <h1>Portfolio Intelligence Hub</h1>
        <p>Register new needs and review the incoming demand queue.</p>
      </header>

      <div className={styles.workflow}>
        <section className={styles.panel} aria-labelledby="register-title">
          <h2 id="register-title">Register a demand</h2>
          <form
            aria-label="Register an IT demand"
            className={styles.form}
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className={styles.field}>
              <label htmlFor="demand-title">Title</label>
              <input
                autoComplete="off"
                id="demand-title"
                maxLength={FIELD_CONFIG.title.maxLength}
                aria-describedby={fieldErrors.title ? 'demand-title-error' : undefined}
                aria-invalid={Boolean(fieldErrors.title)}
                required
                value={form.title}
                onChange={(event) => updateField('title', event.currentTarget.value)}
              />
              {fieldErrors.title && (
                <p className={styles.fieldError} id="demand-title-error" role="alert">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="demand-description">Description</label>
              <textarea
                id="demand-description"
                maxLength={FIELD_CONFIG.description.maxLength}
                aria-describedby={fieldErrors.description ? 'demand-description-error' : undefined}
                aria-invalid={Boolean(fieldErrors.description)}
                required
                rows={5}
                value={form.description}
                onChange={(event) => updateField('description', event.currentTarget.value)}
              />
              {fieldErrors.description && (
                <p className={styles.fieldError} id="demand-description-error" role="alert">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="demand-requester">Requester name</label>
              <input
                autoComplete="name"
                id="demand-requester"
                maxLength={FIELD_CONFIG.requesterName.maxLength}
                aria-describedby={fieldErrors.requesterName ? 'demand-requester-error' : undefined}
                aria-invalid={Boolean(fieldErrors.requesterName)}
                required
                value={form.requesterName}
                onChange={(event) => updateField('requesterName', event.currentTarget.value)}
              />
              {fieldErrors.requesterName && (
                <p className={styles.fieldError} id="demand-requester-error" role="alert">
                  {fieldErrors.requesterName}
                </p>
              )}
            </div>

            {formError && (
              <p className={styles.error} role="alert">
                {formError}
              </p>
            )}
            {successMessage && (
              <p className={styles.success} role="status">
                {successMessage}
              </p>
            )}

            <button className={styles.primaryButton} disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Submitting…' : 'Submit demand'}
            </button>
          </form>
        </section>

        <section className={styles.panel} aria-labelledby="queue-title">
          <div className={styles.queueHeader}>
            <div>
              <h2 id="queue-title">Demand queue</h2>
              {pageData && (
                <p className={styles.resultCount}>
                  {pageData.total} {pageData.total === 1 ? 'demand' : 'demands'}
                </p>
              )}
            </div>
            <button
              className={styles.secondaryButton}
              disabled={isLoading}
              onClick={() => void loadPage(page)}
              type="button"
            >
              Refresh
            </button>
          </div>

          {loadError && (
            <p className={styles.error} role="alert">
              {loadError}
            </p>
          )}
          {isLoading && (
            <p className={styles.statusMessage} role="status">
              Loading demands…
            </p>
          )}
          {!isLoading && pageData?.items.length === 0 && (
            <p className={styles.emptyState}>No demands have been registered.</p>
          )}
          {!isLoading && pageData && pageData.items.length > 0 && (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <caption className={styles.visuallyHidden}>Recently registered demands</caption>
                  <thead>
                    <tr>
                      <th scope="col">Demand</th>
                      <th scope="col">Requester</th>
                      <th scope="col">Status</th>
                      <th scope="col">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>{pageData.items.map(renderDemand)}</tbody>
                </table>
              </div>
              {pageData.totalPages > 1 && (
                <nav aria-label="Demand queue pagination" className={styles.pagination}>
                  <button
                    className={styles.secondaryButton}
                    disabled={isLoading || page <= 1}
                    onClick={() => void loadPage(page - 1)}
                    type="button"
                  >
                    Previous
                  </button>
                  <span aria-live="polite">
                    Page {page} of {pageData.totalPages}
                  </span>
                  <button
                    className={styles.secondaryButton}
                    disabled={isLoading || page >= pageData.totalPages}
                    onClick={() => void loadPage(page + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
