export type AppointmentType = 'consultation' | 'member_interview';
export type AppointmentStatus = 'available' | 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type InterviewType = 'video_call' | 'phone_call' | 'in_person';
export interface RecurringPattern {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    maxOccurrences?: number;
}
export interface AppointmentSlot {
    _id: string;
    type: AppointmentType;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    timezone: string;
    interviewerId: string;
    interviewerName: string;
    interviewerTitle?: string;
    interviewType: InterviewType;
    isAvailable: boolean;
    capacity: number;
    bookedCount: number;
    isRecurring: boolean;
    recurringPattern?: RecurringPattern;
    parentSlotId?: string;
    location?: string;
    meetingUrl?: string;
    meetingId?: string;
    phoneNumber?: string;
    requiresPreApproval: boolean;
    cancellationDeadlineHours: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
export interface AppointmentBooking {
    _id: string;
    slotId: string;
    userId?: string;
    guestInfo?: {
        name: string;
        email: string;
        phone: string;
        preferredContact: 'email' | 'phone' | 'line';
    };
    type: AppointmentType;
    status: AppointmentStatus;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    timezone: string;
    purpose?: string;
    questions?: string[];
    membershipInterest?: UserMembershipType[];
    meetingUrl?: string;
    meetingId?: string;
    dialInNumber?: string;
    location?: string;
    confirmationSent: boolean;
    remindersSent: number;
    completed: boolean;
    outcome?: 'approved' | 'rejected' | 'pending_review';
    interviewNotes?: string;
    rating?: number;
    followUpRequired: boolean;
    bookedAt: Date;
    confirmedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    rescheduleCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Interviewer {
    _id: string;
    userId: string;
    name: string;
    title: string;
    email: string;
    phone?: string;
    avatar?: string;
    appointmentTypes: AppointmentType[];
    interviewTypes: InterviewType[];
    languages: string[];
    specialties: string[];
    isActive: boolean;
    defaultAvailability: {
        [key: string]: {
            enabled: boolean;
            startTime: string;
            endTime: string;
            breakTimes?: Array<{
                startTime: string;
                endTime: string;
            }>;
        };
    };
    maxDailyAppointments: number;
    bufferTimeMinutes: number;
    advanceBookingDays: number;
    autoApproval: boolean;
    totalAppointments: number;
    completedAppointments: number;
    averageRating: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface AvailabilityOverride {
    _id: string;
    interviewerId: string;
    date: string;
    type: 'unavailable' | 'custom_hours' | 'special_event';
    customStartTime?: string;
    customEndTime?: string;
    reason?: string;
    isRecurring: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface AppointmentNotification {
    _id: string;
    bookingId: string;
    userId?: string;
    guestEmail?: string;
    type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';
    method: 'email' | 'sms' | 'line' | 'push';
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    scheduledFor: Date;
    sentAt?: Date;
    subject?: string;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}
export type UserMembershipType = 'visitor' | 'registered' | 'vip' | 'vvip';
export interface UserProfile {
    _id: string;
    email: string;
    name: string;
    age: number;
    location: string;
    phone?: string;
    avatar?: string;
    membership: {
        type: UserMembershipType;
        status: 'pending' | 'active' | 'suspended' | 'profile_completed';
        joinedAt: Date;
        lastPayment?: Date;
        nextPayment?: Date;
    };
    interviewStatus: {
        required: boolean;
        completed: boolean;
        scheduledBookingId?: string;
        completedBookingId?: string;
        duration?: number;
        interviewer?: string;
        notes?: string;
        outcome?: 'approved' | 'rejected' | 'pending_review';
        scheduledAt?: Date;
        completedAt?: Date;
    };
    activityLimits: {
        viewable: number;
        participated: number;
    };
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}
export interface AppointmentSlotWithBookings extends AppointmentSlot {
    bookings: AppointmentBooking[];
    availableCapacity: number;
}
export interface AvailableTimeSlot {
    date: string;
    startTime: string;
    endTime: string;
    slotId: string;
    interviewerId: string;
    interviewerName: string;
    type: AppointmentType;
    duration: number;
    isAvailable: boolean;
}
export interface BookingConfirmation {
    booking: AppointmentBooking;
    slot: AppointmentSlot;
    meetingDetails: {
        url?: string;
        meetingId?: string;
        dialIn?: string;
        location?: string;
    };
    cancellationDeadline: Date;
}
export interface CalendarEvent {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    attendees: string[];
    meetingUrl?: string;
    bookingId: string;
}
export interface AppointmentAnalytics {
    totalSlots: number;
    bookedSlots: number;
    completedAppointments: number;
    noShows: number;
    cancellations: number;
    averageRating: number;
    consultationStats: {
        total: number;
        completed: number;
        conversionRate: number;
    };
    interviewStats: {
        total: number;
        completed: number;
        approvalRate: number;
    };
    dailyStats: Array<{
        date: string;
        bookings: number;
        completions: number;
    }>;
}
//# sourceMappingURL=shared-types.d.ts.map