import { render, screen } from '@testing-library/react'
import { Card } from '@/components/Card'
import { CardState } from '@/lib/api'

describe('Card', () => {
  const mockCard: CardState = {
    id: 'card-1',
    positionIndex: 0,
    isRevealed: false,
    isPrize: false,
  }

  it('renders unrevealed card with question mark', () => {
    render(<Card card={mockCard} />)
    
    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // positionIndex + 1
  })

  it('renders revealed non-prize card', () => {
    const revealedCard = { ...mockCard, isRevealed: true }
    render(<Card card={revealedCard} />)
    
    expect(screen.getByText('❌')).toBeInTheDocument()
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })

  it('renders revealed prize card', () => {
    const prizeCard = { ...mockCard, isRevealed: true, isPrize: true }
    render(<Card card={prizeCard} />)
    
    expect(screen.getByText('🏆')).toBeInTheDocument()
    expect(screen.getByText('PRIZE!')).toBeInTheDocument()
  })

  it('applies correct CSS classes for card states', () => {
    const { container } = render(<Card card={mockCard} />)
    const cardElement = container.querySelector('.card-flip')
    
    expect(cardElement).toBeInTheDocument()
    expect(cardElement).not.toHaveClass('card-flipped')
  })

  it('applies flipped class when card is revealed', () => {
    const revealedCard = { ...mockCard, isRevealed: true }
    const { container } = render(<Card card={revealedCard} />)
    const cardElement = container.querySelector('.card-flip')
    
    expect(cardElement).toHaveClass('card-flipped')
  })
})








