# InfinityMatch 天造地設人成對 - Appointment Business Rules
## Interview System & Booking Management

> **Status**: Production Ready
> **Last Updated**: 2025-07-16
> **Version**: 3.0

---

## Appointment System Overview

### Appointment Types
- **consultation**: Pre-registration consultations (public access)
- **member_interview**: 30-minute member verification interviews (VIP+ only)

### Booking Restrictions by Membership
- **visitor**: Cannot book appointments
- **registered**: Cannot book appointments  
- **vip**: Can book member interviews after payment
- **vvip**: Can book member interviews after payment

## Interview System Business Logic

### Interview Requirements
- **Duration**: 30 minutes exactly
- **Frequency**: One-time requirement per member
- **Purpose**: Identity verification and platform onboarding
- **Outcome**: Pass/fail determines account activation

### Interview Methods
- **video_call**: Video conferences (primary method)
- **phone_call**: Phone interviews (backup option)
- **in_person**: Face-to-face meetings (premium option)

### Interview Scheduling
- **Business Hours**: 9:00 AM - 6:00 PM (Taiwan time)
- **Available Slots**: 1,380 total appointment slots
- **Active Interviewers**: 9 professional interviewers
- **Advance Booking**: 24 hours minimum notice required
- **Time Zones**: All times displayed in Taiwan Standard Time

## Booking Management Rules

### Booking Lifecycle
1. **Slot Selection**: User selects from available calendar
2. **System Validation**: Checks capacity and conflicts
3. **Booking Creation**: Creates pending status booking
4. **Email Confirmation**: Automated confirmation sent
5. **Interviewer Notification**: Staff receives booking alert
6. **Status Updates**: Confirmed → In Progress → Completed

### Cancellation Policy
- **Advance Notice**: 24 hours minimum before appointment
- **Cancellation Window**: Up to 24 hours before scheduled time
- **Automatic Cancellation**: No-show appointments auto-cancelled
- **Refund Eligibility**: Full refund if cancelled within policy

### Rescheduling Rules
- **Frequency**: One reschedule allowed per booking
- **Advance Notice**: 24 hours minimum notice required
- **Availability**: Subject to interviewer schedule availability
- **Process**: Cancel existing + create new booking

## Business Outcomes & Consequences

### Interview Pass Scenarios
- **Account Activation**: Full platform access granted
- **Waiting Period**: 2-month waiting period before event participation
- **Voucher Activation**: Membership vouchers become active
- **Support Access**: Premium customer support available

### Interview Fail Scenarios
- **Full Refund**: 100% refund processed within 7 days
- **Account Suspension**: Temporary suspension of paid features
- **Re-interview Option**: Available after 30-day cooling period
- **Alternative Support**: Access to consultation services

### No-Show Policy
- **Grace Period**: 15 minutes after scheduled time
- **Automatic Failure**: No-show treated as interview failure
- **Refund Policy**: No refund for no-show appointments
- **Rescheduling**: Must book new appointment with full payment

## Operational Guidelines

### Interviewer Management
- **Availability Windows**: Set by individual interviewer schedules
- **Capacity Management**: Maximum concurrent appointments
- **Quality Standards**: Standardized interview processes
- **Backup Coverage**: Cross-trained interviewers for coverage

### System Integration
- **Calendar Sync**: Real-time availability updates
- **Notification System**: Automated email and SMS reminders
- **Recording**: Optional interview recording for quality assurance
- **Documentation**: Interview notes and outcomes tracking

### Performance Metrics
- **Booking Conversion**: Appointment booking to completion rate
- **Interview Success**: Pass rate tracking and optimization
- **Customer Satisfaction**: Post-interview feedback collection
- **Operational Efficiency**: Interviewer utilization metrics

---

**Integration Notes**: This appointment system integrates with the main membership system, payment processing, and customer support workflows to provide a seamless member onboarding experience.