from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import chess
import chess.engine
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def analyze_position(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fen = data.get('fen', '')
        if not fen:
            return JsonResponse({'error': 'FEN not provided'}, status=400)
        
        try:
            # Load the position into the board
            board = chess.Board(fen)
            
            # Start Stockfish engine
            engine = chess.engine.SimpleEngine.popen_uci("/opt/homebrew/bin/stockfish")
            
            # Get the best move and evaluation from Stockfish
            result = engine.play(board, chess.engine.Limit(time=2.0))
            best_move = result.move
            info = engine.analyse(board, chess.engine.Limit(time=2.0))
            evaluation = info["score"].relative.score(mate_score=100000) / 100  # Convert to centipawns
            
            # Clean up and close the engine
            engine.quit()

            return JsonResponse({'bestMove': str(best_move), 'evaluation': evaluation})
        except Exception as e:
            logger.error(f"Error analyzing position: {str(e)}")
            return JsonResponse({'error': 'Failed to analyze position'}, status=500)
        
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def analyze_batch(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fens = data.get('fens', [])
        if not fens:
            return JsonResponse({'error': 'No FENs provided'}, status=400)
        
        try:
            evaluations = []

            # Start Stockfish engine
            engine = chess.engine.SimpleEngine.popen_uci("/opt/homebrew/bin/stockfish")

            for fen in fens:
                # Load the position into the board
                board = chess.Board(fen)

                # Get the evaluation from Stockfish
                info = engine.analyse(board, chess.engine.Limit(time=2.0))
                score = info["score"].relative.score(mate_score=100000) / 100  # Convert to centipawns
                evaluations.append(score)

            # Clean up and close the engine
            engine.quit()

            return JsonResponse({'evaluations': evaluations})
        except Exception as e:
            logger.error(f"Error in batch analysis: {str(e)}")
            return JsonResponse({'error': 'Failed to analyze batch positions'}, status=500)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)
