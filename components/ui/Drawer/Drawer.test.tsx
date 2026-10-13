import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

function renderDrawer(open = true, onClose = vi.fn()) {
  const utils = render(
    <>
      <button type="button">Open</button>
      <Drawer open={open} title="Transaction details" onClose={onClose}>
        <p>Body</p>
        <button type="button">Copy</button>
      </Drawer>
    </>
  )
  return { ...utils, onClose }
}

describe('Drawer', () => {
  it('is a dialog labelled by its title and takes focus when opened', () => {
    renderDrawer()
    const dialog = screen.getByRole('dialog', { name: 'Transaction details' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveFocus()
  })

  it('closes on Escape, the close button and a backdrop click, but not on clicks inside', async () => {
    const { onClose } = renderDrawer()
    await userEvent.click(screen.getByText('Body'))
    expect(onClose).not.toHaveBeenCalled()

    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(2)

    await userEvent.click(screen.getByRole('dialog').parentElement!)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('keeps Tab inside the dialog', async () => {
    renderDrawer()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('stays mounted while sliding out, then unmounts', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <Drawer open title="Transaction details" onClose={() => {}}>
        Body
      </Drawer>
    )
    rerender(
      <Drawer open={false} title="Transaction details" onClose={() => {}}>
        Body
      </Drawer>
    )
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('returns focus to the opener and unlocks scrolling when closed', () => {
    const { rerender } = render(
      <>
        <button type="button">Open</button>
        <Drawer open={false} title="Transaction details" onClose={() => {}}>
          Body
        </Drawer>
      </>
    )
    const opener = screen.getByRole('button', { name: 'Open' })
    opener.focus()

    rerender(
      <>
        <button type="button">Open</button>
        <Drawer open title="Transaction details" onClose={() => {}}>
          Body
        </Drawer>
      </>
    )
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.getByRole('dialog')).toHaveFocus()

    rerender(
      <>
        <button type="button">Open</button>
        <Drawer open={false} title="Transaction details" onClose={() => {}}>
          Body
        </Drawer>
      </>
    )
    expect(document.body.style.overflow).toBe('')
    expect(opener).toHaveFocus()
  })
})
