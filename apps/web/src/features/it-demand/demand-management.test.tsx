import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { components } from '../../../../../packages/api-client/src/index.js';
import { DemandManagement } from './demand-management';

type Demand = components['schemas']['DemandResponseDto'];
type DemandPage = components['schemas']['PaginatedDemandsResponseDto'];

const fetchMock = vi.fn<typeof fetch>();

function makeDemand(id: string, title: string): Demand {
  return {
    id,
    title,
    description: `${title} description`,
    requesterName: 'Alex Morgan',
    status: 'New',
    createdAt: '2026-11-16T12:00:00.000Z',
    updatedAt: '2026-11-16T12:00:00.000Z',
  };
}

function makePage(items: Demand[], page = 1, total = items.length, totalPages = 1): DemandPage {
  return {
    items,
    page,
    pageSize: 20,
    total,
    totalPages,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getRequestUrl(input: RequestInfo | URL | undefined): URL {
  if (!input) {
    throw new Error('Expected the API client to make a request.');
  }

  if (typeof input === 'string') {
    return new URL(input);
  }

  if (input instanceof URL) {
    return input;
  }

  return new URL(input.url);
}

async function getRequestBody(
  input: RequestInfo | URL | undefined,
  init: RequestInit | undefined,
): Promise<string | undefined> {
  if (typeof init?.body === 'string') {
    return init.body;
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.clone().text();
  }

  return undefined;
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:4000');
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('DemandManagement', () => {
  it('shows loading and empty states while loading the queue', async () => {
    let resolveResponse: (response: Response) => void = () => {
      throw new Error('The queue request was not started.');
    };
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );

    render(<DemandManagement />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading demands');
    resolveResponse(jsonResponse(makePage([])));
    expect(await screen.findByText('No demands have been registered.')).toBeInTheDocument();
  });

  it('validates required fields and does not send an invalid demand', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(makePage([])));
    render(<DemandManagement />);

    await screen.findByText('No demands have been registered.');
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
      target: { value: 'A business need' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Requester name' }), {
      target: { value: 'Alex Morgan' },
    });
    fireEvent.submit(screen.getByRole('form', { name: 'Register an IT demand' }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 't'.repeat(121) },
    });
    fireEvent.submit(screen.getByRole('form', { name: 'Register an IT demand' }));

    expect(screen.getByText('Title must be 120 characters or fewer.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes the currently selected queue page on request', async () => {
    const firstPage = makePage([makeDemand('demand-1', 'Demand 1')], 1, 2, 2);
    fetchMock
      .mockResolvedValueOnce(jsonResponse(firstPage))
      .mockResolvedValueOnce(jsonResponse(firstPage));
    render(<DemandManagement />);

    expect(await screen.findByText('Demand 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(getRequestUrl(fetchMock.mock.calls[1]?.[0]).searchParams.get('page')).toBe('1');
  });

  it('registers a demand and refreshes the queue from the first page', async () => {
    const submittedDemand = makeDemand('new-demand', 'Replace reporting');
    fetchMock
      .mockResolvedValueOnce(jsonResponse(makePage([])))
      .mockResolvedValueOnce(jsonResponse(submittedDemand, 201))
      .mockResolvedValueOnce(jsonResponse(makePage([submittedDemand])));
    render(<DemandManagement />);

    await screen.findByText('No demands have been registered.');
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: '  Replace reporting  ' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
      target: { value: '  Unsupported tool delays close.  ' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Requester name' }), {
      target: { value: '  Alex Morgan  ' },
    });
    fireEvent.submit(screen.getByRole('form', { name: 'Register an IT demand' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Demand registered successfully.');
    expect(await screen.findByText('Replace reporting')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const postBody = await getRequestBody(
      fetchMock.mock.calls[1]?.[0],
      fetchMock.mock.calls[1]?.[1],
    );
    expect(postBody).toBeDefined();
    expect(JSON.parse(postBody ?? 'null')).toEqual({
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
    });
    expect(getRequestUrl(fetchMock.mock.calls[2]?.[0]).searchParams.get('page')).toBe('1');
  });

  it('shows API errors when registration fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(makePage([])))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));
    render(<DemandManagement />);

    await screen.findByText('No demands have been registered.');
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Replace reporting' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
      target: { value: 'Unsupported tool delays close.' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Requester name' }), {
      target: { value: 'Alex Morgan' },
    });
    fireEvent.submit(screen.getByRole('form', { name: 'Register an IT demand' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 503');
  });

  it('loads previous and next pages from the API', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(makePage([makeDemand('demand-1', 'Demand 1')], 1, 2, 2)))
      .mockResolvedValueOnce(jsonResponse(makePage([makeDemand('demand-2', 'Demand 2')], 2, 2, 2)))
      .mockResolvedValueOnce(jsonResponse(makePage([makeDemand('demand-1', 'Demand 1')], 1, 2, 2)));
    render(<DemandManagement />);

    expect(await screen.findByText('Demand 1')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Demand 2')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Page 2 of 2')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findByText('Demand 1')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Page 1 of 2')).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getRequestUrl(fetchMock.mock.calls[1]?.[0]).searchParams.get('page')).toBe('2');
    expect(getRequestUrl(fetchMock.mock.calls[2]?.[0]).searchParams.get('page')).toBe('1');
  });

  it('shows a load error instead of an empty-state message when the API is unavailable', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    render(<DemandManagement />);

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 503');
    expect(screen.queryByText('No demands have been registered.')).not.toBeInTheDocument();
  });
});
