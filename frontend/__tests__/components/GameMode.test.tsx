import { render, screen, fireEvent } from '@testing-library/react'
import { GameMode } from '@/components/GameMode'

describe('GameMode', () => {
  const mockOnSelectMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the game mode selection screen', () => {
    render(<GameMode onSelectMode={mockOnSelectMode} />)
    
    expect(screen.getByText('🎴 Razz')).toBeInTheDocument()
    expect(screen.getByText('Card Reveal Game')).toBeInTheDocument()
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Player Lobby')).toBeInTheDocument()
  })

  it('calls onSelectMode with "admin" when admin button is clicked', () => {
    render(<GameMode onSelectMode={mockOnSelectMode} />)
    
    const adminButton = screen.getByText('Admin Dashboard').closest('button')
    fireEvent.click(adminButton!)
    
    expect(mockOnSelectMode).toHaveBeenCalledWith('admin')
  })

  it('calls onSelectMode with "player" when player button is clicked', () => {
    render(<GameMode onSelectMode={mockOnSelectMode} />)
    
    const playerButton = screen.getByText('Player Lobby').closest('button')
    fireEvent.click(playerButton!)
    
    expect(mockOnSelectMode).toHaveBeenCalledWith('player')
  })

  it('displays feature descriptions', () => {
    render(<GameMode onSelectMode={mockOnSelectMode} />)
    
    expect(screen.getByText('Create games, manage players, and control the game flow')).toBeInTheDocument()
    expect(screen.getByText('Join games with your code and play with others')).toBeInTheDocument()
  })
})











