# Audio Files for Hover Music Feature

This directory contains 5-second audio clips that play when users hover over different event tickets.

## Required Audio Files (5 seconds each, MP3 format)

### Artist-Specific Music

- `coldplay-preview.mp3` - Coldplay song snippet for Coldplay concerts
- `bollywood-music.mp3` - Popular Bollywood track snippet
- `classical-orchestra.mp3` - Classical music orchestral piece
- `jazz-club.mp3` - Jazz instrumental snippet
- `rock-concert.mp3` - Rock/metal music preview
- `pop-concert.mp3` - Pop music snippet

### Sports Events

- `cricket-stadium.mp3` - Cricket match crowd sounds and atmosphere
- `football-stadium.mp3` - Football stadium chants and crowd noise
- `sports-arena.mp3` - General sports arena atmosphere

### Category-Based

- `cinema-theme.mp3` - Movie theater ambience or film score snippet
- `travel-music.mp3` - Travel/journey themed background music
- `live-event.mp3` - General live event atmosphere
- `default-event.mp3` - Default background music for unmatched events

## How It Works

The system automatically selects the appropriate audio file based on:

1. **Event Title** - Specific artist names (Coldplay, etc.)
2. **Event Category** - Sports, movies, concerts, buses
3. **Venue Location** - Special handling for Mumbai Bollywood events
4. **Keywords** - Rock, jazz, classical, cricket, football, etc.

## Audio Requirements

- **Format**: MP3
- **Duration**: Exactly 5 seconds
- **Volume**: Pre-normalized (system plays at 40% volume)
- **Loop**: Files automatically loop while hovering
- **Quality**: 128kbps recommended for web optimization

## Adding New Audio Files

1. Place MP3 files in this directory
2. Update the `getMusicFileForEvent` function in `useHoverMusic.ts`
3. Add new mapping logic for your specific events

## Fallback Behavior

If an audio file is missing, the system automatically falls back to Web Audio API-generated tones that match the event category.
