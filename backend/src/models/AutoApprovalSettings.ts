import mongoose, { Schema, Document } from 'mongoose';

export interface IAutoApprovalSettings extends Document {
    ownerId: mongoose.Types.ObjectId;
    autoApproval: {
        enabled: boolean;
        requirePaymentProof: boolean;
        notifyOnAutoApproval: boolean;

        amountRules?: {
            enabled: boolean;
            maxAutoApproveAmount?: number;
            requireManualAbove?: number;
        };

        customerRules?: {
            enabled: boolean;
            autoApproveRepeatCustomers: boolean;
            minimumPreviousBookings: number;
            requireVerifiedPhone: boolean;
            requireVerifiedEmail: boolean;
        };

        timeRules?: {
            enabled: boolean;
            businessHours?: {
                start: string;
                end: string;
            };
            allowedDays: number[]; // 1=Monday, 7=Sunday
            blockPeakHours: boolean;
            peakHours?: string[];
        };

        slotRules?: {
            enabled: boolean;
            specificCourts: mongoose.Types.ObjectId[];
            excludeCourts: mongoose.Types.ObjectId[];
        };

        aiSettings?: {
            enabled: boolean;
            trustScoreThreshold: number;
            fraudDetectionEnabled: boolean;
            autoLearnFromApprovals: boolean;
        };
    };

    stats: {
        totalAutoApproved: number;
        totalManualReviews: number;
        averageApprovalTime: number;
        lastUpdated: Date;
    };

    createdAt: Date;
    updatedAt: Date;
}

const autoApprovalSettingsSchema = new Schema<IAutoApprovalSettings>(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'Owner',
            required: true,
            unique: true
        },
        autoApproval: {
            enabled: {
                type: Boolean,
                default: true
            },
            requirePaymentProof: {
                type: Boolean,
                default: true
            },
            notifyOnAutoApproval: {
                type: Boolean,
                default: true
            },

            amountRules: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                maxAutoApproveAmount: Number,
                requireManualAbove: Number
            },

            customerRules: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                autoApproveRepeatCustomers: {
                    type: Boolean,
                    default: true
                },
                minimumPreviousBookings: {
                    type: Number,
                    default: 2
                },
                requireVerifiedPhone: {
                    type: Boolean,
                    default: false
                },
                requireVerifiedEmail: {
                    type: Boolean,
                    default: false
                }
            },

            timeRules: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                businessHours: {
                    start: {
                        type: String,
                        default: '06:00'
                    },
                    end: {
                        type: String,
                        default: '23:00'
                    }
                },
                allowedDays: {
                    type: [Number],
                    default: [1, 2, 3, 4, 5, 6, 7]
                },
                blockPeakHours: {
                    type: Boolean,
                    default: false
                },
                peakHours: [String]
            },

            slotRules: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                specificCourts: [{
                    type: Schema.Types.ObjectId,
                    ref: 'Court'
                }],
                excludeCourts: [{
                    type: Schema.Types.ObjectId,
                    ref: 'Court'
                }]
            },

            aiSettings: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                trustScoreThreshold: {
                    type: Number,
                    default: 60,
                    min: 0,
                    max: 100
                },
                fraudDetectionEnabled: {
                    type: Boolean,
                    default: false
                },
                autoLearnFromApprovals: {
                    type: Boolean,
                    default: false
                }
            }
        },

        stats: {
            totalAutoApproved: {
                type: Number,
                default: 0
            },
            totalManualReviews: {
                type: Number,
                default: 0
            },
            averageApprovalTime: {
                type: Number,
                default: 0
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes
// ownerId is already unique: true in schema definition


const AutoApprovalSettings = mongoose.model<IAutoApprovalSettings>(
    'AutoApprovalSettings',
    autoApprovalSettingsSchema
);

export default AutoApprovalSettings;
