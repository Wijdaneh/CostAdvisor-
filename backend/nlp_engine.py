import pandas as pd

class NLPEngine:
    def __init__(self, data: pd.DataFrame = None):
        self.data = data
        
    def set_data(self, data: pd.DataFrame):
        self.data = data

    def detect_intent(self, query: str) -> str:
        query = query.lower()
        if any(w in query for w in ["pourquoi", "cause", "écart", "explication", "raison"]):
            return "explain_variance"
        if any(w in query for w in ["comparer", "classement", "meilleur", "pire", "rentable", "coûteux", "top"]):
            return "ranking"
        return "general_analysis"
        
    def generate_response(self, query: str) -> dict:
        if self.data is None or self.data.empty:
            return {"text": "Aucune donnée n'est chargée. Veuillez d'abord importer un fichier.", "structured": None}
            
        intent = self.detect_intent(query)
        
        if intent == "explain_variance":
            return self._explain_variance()
        elif intent == "ranking":
            return self._ranking(query)
        else:
            return self._general_analysis()
    
    def _explain_variance(self):
        # Find biggest positive variance (Over budget)
        if 'variance' not in self.data.columns:
             return {"text": "Impossible de calculer les écarts.", "structured": None}
             
        # Filter for over-budget items only
        over_budget = self.data[self.data['variance'] > 0]
        
        if over_budget.empty:
            return {
                "text": "Bonne nouvelle ! Aucun service n'est au-dessus du budget ce mois-ci.",
                "structured": {
                    "type": "good_news",
                    "impact": "Respect budgétaire global",
                    "recommendation": "Maintenir la gestion actuelle."
                }
            }
            
        worst_idx = over_budget['variance'].idxmax()
        worst = over_budget.loc[worst_idx]
        
        return {
            "text": f"Le service {worst['service']} présente le plus grand dépassement.",
            "structured": {
                "type": "alert",
                "cause": f"Dépassement de {worst['variance']:.2f}€ par rapport au budget de {worst['budget']:.2f}€.",
                "impact": "Impact négatif sur la marge opérationnelle du mois.",
                "recommendation": f"Analyser les postes de coûts '{worst.get('type', 'Inconnu')}' pour le service {worst['service']}."
            }
        }

    def _ranking(self, query):
        # Determine sort criteria
        query = query.lower()
        
        if any(w in query for w in ["coûteux", "pire", "dépense"]):
            # Highest Real Cost
            sorted_df = self.data.sort_values(by="real", ascending=False).head(3)
            title = "Top 3 des services les plus coûteux"
        elif any(w in query for w in ["rentable", "meilleur", "bon"]):
            # Best Under-budget (Most negative variance or specific criteria?)
            # Let's say: Lowest Variance (most negative = most under budget)
            sorted_df = self.data.sort_values(by="variance", ascending=True).head(3)
            title = "Top 3 des services les plus performants (sous-budget)"
        else:
            # Default to Highest Variance (Over budget)
            sorted_df = self.data.sort_values(by="variance", ascending=False).head(3)
            title = "Top 3 des plus gros écarts budgétaires"
        
        items = []
        for _, row in sorted_df.iterrows():
            items.append(f"{row['service']}: {row['real']}€ (Budget: {row['budget']}€)")
            
        return {
            "text": f"Voici le {title} :",
            "structured": {
                "type": "list",
                "items": items
            }
        }

    def _general_analysis(self):
        total_real = self.data['real'].sum()
        total_budget = self.data['budget'].sum()
        diff = total_real - total_budget
        
        status = "dépassement" if diff > 0 else "économie"
        
        return {
            "text": f"Au global, les dépenses sont de {total_real:.2f}€ pour un budget de {total_budget:.2f}€.",
            "structured": {
                "type": "summary",
                "impact": f"Soit une {status} globale de {abs(diff):.2f}€.",
                "recommendation": "Voir le tableau de bord pour plus de détails."
            }
        }
