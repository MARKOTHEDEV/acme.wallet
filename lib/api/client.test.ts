import { api, ApiError } from './client'

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('api client', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves with the envelope on 2xx', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: { id: 'txn_1' } }))
    await expect(api.get<{ id: string }>('/transactions/txn_1')).resolves.toEqual({ data: { id: 'txn_1' } })
    expect(fetchMock).toHaveBeenCalledWith('/api/transactions/txn_1', expect.objectContaining({}))
  })

  it('rejects with an ApiError carrying the backend code and message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(422, { error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient balance' } })
    )
    const err = await api.post('/convert', {}).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 422, code: 'INSUFFICIENT_FUNDS', message: 'Insufficient balance' })
  })

  it('still rejects when an error response has no JSON body', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }))
    const err = await api.get('/me').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 502, code: 'HTTP_ERROR' })
  })

  it('forwards an abort signal', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValue(jsonResponse(200, { data: [] }))
    await api.get('/transactions', { signal: controller.signal })
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ signal: controller.signal })
  })
})
