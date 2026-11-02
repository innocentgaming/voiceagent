# IndicVoice Lab - Benchmark Audio Samples & Scenarios

This directory contains test scenarios and documentation for evaluating Indian-language voice recognition with **Gnani Prisma STT**.

---

### Scenario 1: High-Stakes UPI Payment (Recipient Name & Amount)
- **Audio File Reference**: `upi_transfer_rahul.wav`
- **Language**: Hinglish / Indian English
- **Expected Transcript**: `"I want to send five hundred rupees to Rahul."`
- **Critical Entities**:
  - `Recipient Name` (Type: `person`): **Rahul**
  - `Transfer Amount` (Type: `amount`): **five hundred**
- **Test Objective**:
  Demonstrates that an STT system can achieve an 88.9% phonetic accuracy with a low WER of 11.1%, yet cause a **catastrophic financial failure** if `"Rahul"` is misrecognized as `"Rohan"`. IndicVoice Lab flags this as a **CRITICAL ENTITY MISMATCH**.

---

### Scenario 2: Hindi Voice Banking (Amount Discrepancy)
- **Audio File Reference**: `hindi_banking_amount.wav`
- **Language**: Hindi (`hi`)
- **Acoustic Condition**: Background ambient noise (simulated banking hall)
- **Expected Transcript**: `"मुझे पाँच सौ रुपये राहुल को भेजने हैं।"`
- **Critical Entities**:
  - `राशि (Amount)`: **पाँच सौ** (or 500)
  - `प्राप्तकर्ता (Recipient)`: **राहुल**
- **Test Objective**:
  Tests Devanagari script normalization, danda (`।`) stripping, and numerical entity resolution in Hindi.

---

### Scenario 3: Marathi Customer Service
- **Audio File Reference**: `marathi_order_inquiry.wav`
- **Language**: Marathi (`mr`)
- **Acoustic Condition**: Clean studio audio
- **Expected Transcript**: `"मला पाचशे रुपये राहुलला पाठवायचे आहेत."`
- **Critical Entities**:
  - `रक्कम (Amount)`: **पाचशे**
  - `नाव (Name)`: **राहुल**
- **Test Objective**:
  Evaluates regional inflection and suffix matching (`राहुलला`, `पाठवायचे आहेत`).

---

### Scenario 4: Hinglish Code-Mixed Command
- **Audio File Reference**: `ecommerce_cancellation.wav`
- **Language**: Hinglish (`hi-en`)
- **Expected Transcript**: `"mera order cancel kardo please"`
- **Test Objective**:
  Tests code-switching between Hindi grammar and English loan words (`order`, `cancel`, `please`).

