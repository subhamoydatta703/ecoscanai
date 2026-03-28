import numpy as np
from sklearn.ensemble import IsolationForest

class MLEngine:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        
    def detect_anomalies(self, file_metrics: list[dict]) -> list[dict]:
        """
        Takes a list of file metrics, trains an IsolationForest, 
        and flags "energy-hungry" anomalies.
        """
        if not file_metrics:
            return []

        features = []
        for metric in file_metrics:
            features.append([
                metric.get('file_size', 0),
                metric.get('lines_of_code', 0),
                metric.get('loop_depth', 0),
                metric.get('sync_api_calls', 0),
                metric.get('computational_complexity', 0)
            ])
            
        X = np.array(features)

        if len(X) < 5:
            for metric in file_metrics:
                metric['is_anomaly'] = metric.get('computational_complexity', 0) > 10 or metric.get('loop_depth', 0) > 2
                metric['anomaly_score'] = 0.8 if metric['is_anomaly'] else 0.1
            return file_metrics

        self.model.fit(X)
        predictions = self.model.predict(X)
        scores = self.model.score_samples(X)
        normalized_scores = (scores.max() - scores) / (scores.max() - scores.min() + 1e-10)

        for i, metric in enumerate(file_metrics):
            is_anomaly = predictions[i] == -1 or metric.get('computational_complexity', 0) > 20
            metric['is_anomaly'] = bool(is_anomaly)
            metric['anomaly_score'] = float(normalized_scores[i])
            
            if is_anomaly:
                reasons = []
                if metric.get('loop_depth', 0) > 2:
                    reasons.append("Deeply nested loops detected")
                if metric.get('sync_api_calls', 0) > 2:
                    reasons.append("High number of API calls")
                if metric.get('file_size', 0) > 50000:
                    reasons.append("Excessively large file")
                
                if not reasons:
                     reasons.append("Statistical deviation in structural complexity (Isolation Forest Anomaly)")
                     
                metric['anomaly_reasons'] = reasons

        return file_metrics
