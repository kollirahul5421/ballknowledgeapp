from nba_api.stats.static import players
import csv

# Read unmatched player names from file
with open("unmatched_players.txt", "r") as f:
    names = [line.strip() for line in f if line.strip()]

results = []

for name in names:
    matches = players.find_players_by_full_name(name)
    if matches:
        nba_id = matches[0]["id"]
        print(f"✅ {name}: {nba_id}")
        results.append({"name": name, "nba_player_id": nba_id})
    else:
        print(f"❓ {name}: No match")
        results.append({"name": name, "nba_player_id": ""})

# Write results to CSV
with open("nba_id_lookup_results.csv", "w", newline="") as csvfile:
    fieldnames = ["name", "nba_player_id"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in results:
        writer.writerow(row)

print("\nDone! Results written to nba_id_lookup_results.csv")
