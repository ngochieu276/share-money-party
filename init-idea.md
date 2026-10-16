# Drinking Party Bill Splitting App – Requirements

## 1. Member Management
- Manage a group of members.
- Import members and maintain a list of members by name.
- Allow members to be added, edited, and removed.

## 2. Party Management
- Create a party, represented by its date.
- Select which members will attend the party.
- Record the total bill after the party. This is the total amount that needs to be split among the attendees.

## 3. Betting Match Management
The bill will not be split equally among everyone. Each member's final payment will also be affected by the betting results of matches played before or during the party.

For example:
- Four members: A, B, C, and D.
- Two teams compete: Team A (A and B) vs. Team B (C and D).
- Team A wins a bet of 80,000 VND.
- Team B loses, so C and D each owe 40,000 VND.

For each betting match, record:
- Match date.
- Bet amount.
- The two competing teams and their respective members.
- The match result (winning team and losing team).

Each party should have a list of all betting matches associated with that party, allowing users to review the match history.

## 4. Bill Splitting Calculation

The total amount each member must pay is calculated based on the total party bill and their betting losses.

### Variables
- **S0**: Total party bill.
- **S1**: Total betting amount, calculated as the sum of all betting amounts for the party.
- **S2**: Bill amount to be split equally among attendees, excluding the betting amount.
- **A0**: Base amount per attendee.
- **N**: Number of attendees.
- **Li**: Total betting losses owed by member *i*.

### Formula

1. Calculate the total betting amount:

   `S1 = Sum of all betting amounts`

2. Calculate the remaining bill to be split equally:

   `S2 = S0 - S1`

3. Calculate the base amount per attendee:

   `A0 = S2 / N`

4. Calculate the total amount each member must pay:

   `Total payment for member i = A0 + Li`

Where **Li** is the sum of the betting losses owed by that member across all matches in the party.

### Example

Suppose:
- Total party bill (S0): 1,000,000 VND.
- Total betting amount (S1): 80,000 VND.
- Number of attendees (N): 4.
- Betting result: C and D lose 80,000 VND in total, so each owes 40,000 VND.

Calculation:
- Remaining bill (S2): 1,000,000 − 80,000 = 920,000 VND.
- Base amount per attendee (A0): 920,000 / 4 = 230,000 VND.

| Member | Base Amount | Betting Loss | Total Payment |
|---|---:|---:|---:|
| A | 230,000 VND | 0 VND | 230,000 VND |
| B | 230,000 VND | 0 VND | 230,000 VND |
| C | 230,000 VND | 40,000 VND | 270,000 VND |
| D | 230,000 VND | 40,000 VND | 270,000 VND |
| **Total** | **920,000 VND** | **80,000 VND** | **1,000,000 VND** |

## 5. Party Settlement Summary
- Display the final bill settlement for each party in a table.
- Include all attendees and their respective payment amounts.
- Show a breakdown of each member's payment:
  - Base bill amount.
  - Total betting losses.
  - Final amount to pay.
- Allow users to view the betting match history for each party.
- Ensure that the total amount collected from all members equals the total party bill.