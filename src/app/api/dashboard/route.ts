import { NextResponse } from 'next/server';
import { getRecordModel } from '@/lib/models/record';
import { withAuth } from '@/lib/auth-middleware';
import { Op, fn, col, literal } from 'sequelize';

export const GET = withAuth(async (req: Request, user) => {
  try {
    const RecordModel = await getRecordModel();

    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    // Helper function to get date range for a month
    const getMonthRange = (year: number, month: number) => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      return {
        [Op.gte]: startDate.toISOString().split('T')[0],
        [Op.lte]: endDate.toISOString().split('T')[0],
      };
    };

    // Date ranges
    const currentMonthRange = getMonthRange(currentYear, currentMonth);
    const previousMonthRange = getMonthRange(previousMonthYear, previousMonth);
    const currentYearRange = {
      [Op.gte]: `${currentYear}-01-01`,
      [Op.lte]: `${currentYear}-12-31`,
    };
    const previousYearRange = {
      [Op.gte]: `${currentYear - 1}-01-01`,
      [Op.lte]: `${currentYear - 1}-12-31`,
    };

    // Single comprehensive aggregation query
    const [statsResult] = (await RecordModel.findAll({
      attributes: [
        // Overall counts (excluding returned items)
        [
          fn('COUNT', literal('CASE WHEN "isReturned" = false THEN 1 END')),
          'totalRecords',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemType" = \'Gold\' AND "isReturned" = false THEN 1 END'
            )
          ),
          'totalGoldCount',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemType" = \'Silver\' AND "isReturned" = false THEN 1 END'
            )
          ),
          'totalSilverCount',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemType" = \'Both\' AND "isReturned" = false THEN 1 END'
            )
          ),
          'totalBothCount',
        ],
        [
          fn(
            'SUM',
            literal('CASE WHEN "isReturned" = false THEN "goldWeightGrams" END')
          ),
          'totalGoldWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              'CASE WHEN "isReturned" = false THEN "silverWeightGrams" END'
            )
          ),
          'totalSilverWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              'CASE WHEN "itemType" = \'Gold\' AND "isReturned" = false THEN "amount" END'
            )
          ),
          'totalGoldAmount',
        ],
        [
          fn(
            'SUM',
            literal(
              'CASE WHEN "itemType" = \'Silver\' AND "isReturned" = false THEN "amount" END'
            )
          ),
          'totalSilverAmount',
        ],
        [
          fn(
            'SUM',
            literal('CASE WHEN "isReturned" = false THEN "goldWeightGrams" END')
          ),
          'totalGoldWeightGrams',
        ],
        [
          fn(
            'SUM',
            literal(
              'CASE WHEN "isReturned" = false THEN "silverWeightGrams" END'
            )
          ),
          'totalSilverWeightGrams',
        ],
        [
          fn(
            'SUM',
            literal('CASE WHEN "isReturned" = false THEN "amount" END')
          ),
          'totalAmount',
        ],

        // Returned items stats
        [
          fn('COUNT', literal('CASE WHEN "isReturned" = true THEN 1 END')),
          'totalReturnedRecords',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemType" = \'Gold\' AND "isReturned" = true THEN 1 END'
            )
          ),
          'totalReturnedGoldCount',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemType" = \'Silver\' AND "isReturned" = true THEN 1 END'
            )
          ),
          'totalReturnedSilverCount',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemType" = \'Both\' AND "isReturned" = true THEN 1 END'
            )
          ),
          'totalReturnedBothCount',
        ],
        [
          fn(
            'SUM',
            literal('CASE WHEN "isReturned" = true THEN "returnedAmount" END')
          ),
          'totalReturnedAmount',
        ],
        [
          fn(
            'SUM',
            literal('CASE WHEN "isReturned" = true THEN "goldWeightGrams" END')
          ),
          'totalReturnedGoldWeightGrams',
        ],
        [
          fn(
            'SUM',
            literal(
              'CASE WHEN "isReturned" = true THEN "silverWeightGrams" END'
            )
          ),
          'totalReturnedSilverWeightGrams',
        ],

        // Category counts (excluding returned items)
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemCategory" = \'active\' AND "isReturned" = false THEN 1 END'
            )
          ),
          'activeRecords',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemCategory" = \'archived\' AND "isReturned" = false THEN 1 END'
            )
          ),
          'archivedRecords',
        ],
        [
          fn(
            'COUNT',
            literal(
              'CASE WHEN "itemCategory" = \'big\' AND "isReturned" = false THEN 1 END'
            )
          ),
          'bigRecords',
        ],

        // Current month stats (excluding returned items)
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "isReturned" = false THEN 1 END`
            )
          ),
          'currentMonthRecords',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "isReturned" = false THEN "goldWeightGrams" END`
            )
          ),
          'currentMonthGoldWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "isReturned" = false THEN "silverWeightGrams" END`
            )
          ),
          'currentMonthSilverWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "isReturned" = false THEN "amount" END`
            )
          ),
          'currentMonthAmount',
        ],
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "itemType" = 'Gold' AND "isReturned" = false THEN 1 END`
            )
          ),
          'currentMonthGold',
        ],
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "itemType" = 'Silver' AND "isReturned" = false THEN 1 END`
            )
          ),
          'currentMonthSilver',
        ],
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${currentMonthRange[Op.gte]}' AND "date" <= '${currentMonthRange[Op.lte]}' AND "itemType" = 'Both' AND "isReturned" = false THEN 1 END`
            )
          ),
          'currentMonthBoth',
        ],

        // Previous month stats (excluding returned items)
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${previousMonthRange[Op.gte]}' AND "date" <= '${previousMonthRange[Op.lte]}' AND "isReturned" = false THEN 1 END`
            )
          ),
          'previousMonthRecords',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${previousMonthRange[Op.gte]}' AND "date" <= '${previousMonthRange[Op.lte]}' AND "isReturned" = false THEN "goldWeightGrams" END`
            )
          ),
          'previousMonthGoldWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${previousMonthRange[Op.gte]}' AND "date" <= '${previousMonthRange[Op.lte]}' AND "isReturned" = false THEN "silverWeightGrams" END`
            )
          ),
          'previousMonthSilverWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${previousMonthRange[Op.gte]}' AND "date" <= '${previousMonthRange[Op.lte]}' AND "isReturned" = false THEN "amount" END`
            )
          ),
          'previousMonthAmount',
        ],

        // Current year stats (excluding returned items)
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${currentYearRange[Op.gte]}' AND "date" <= '${currentYearRange[Op.lte]}' AND "isReturned" = false THEN 1 END`
            )
          ),
          'currentYearRecords',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${currentYearRange[Op.gte]}' AND "date" <= '${currentYearRange[Op.lte]}' AND "isReturned" = false THEN "goldWeightGrams" END`
            )
          ),
          'currentYearGoldWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${currentYearRange[Op.gte]}' AND "date" <= '${currentYearRange[Op.lte]}' AND "isReturned" = false THEN "silverWeightGrams" END`
            )
          ),
          'currentYearSilverWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${currentYearRange[Op.gte]}' AND "date" <= '${currentYearRange[Op.lte]}' AND "isReturned" = false THEN "amount" END`
            )
          ),
          'currentYearAmount',
        ],

        // Previous year stats (excluding returned items)
        [
          fn(
            'COUNT',
            literal(
              `CASE WHEN "date" >= '${previousYearRange[Op.gte]}' AND "date" <= '${previousYearRange[Op.lte]}' AND "isReturned" = false THEN 1 END`
            )
          ),
          'previousYearRecords',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${previousYearRange[Op.gte]}' AND "date" <= '${previousYearRange[Op.lte]}' AND "isReturned" = false THEN "goldWeightGrams" END`
            )
          ),
          'previousYearGoldWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${previousYearRange[Op.gte]}' AND "date" <= '${previousYearRange[Op.lte]}' AND "isReturned" = false THEN "silverWeightGrams" END`
            )
          ),
          'previousYearSilverWeight',
        ],
        [
          fn(
            'SUM',
            literal(
              `CASE WHEN "date" >= '${previousYearRange[Op.gte]}' AND "date" <= '${previousYearRange[Op.lte]}' AND "isReturned" = false THEN "amount" END`
            )
          ),
          'previousYearAmount',
        ],
      ],
      raw: true,
    })) as any[];

    // Extract values and convert to numbers
    const stats = {
      totalRecords: Number(statsResult.totalRecords || 0),
      totalGoldCount: Number(statsResult.totalGoldCount || 0),
      totalSilverCount: Number(statsResult.totalSilverCount || 0),
      totalBothCount: Number(statsResult.totalBothCount || 0),
      totalGoldWeight: Number(statsResult.totalGoldWeight || 0),
      totalSilverWeight: Number(statsResult.totalSilverWeight || 0),
      totalGoldAmount: Number(statsResult.totalGoldAmount || 0),
      totalSilverAmount: Number(statsResult.totalSilverAmount || 0),
      totalWeightGrams:
        Number(statsResult.totalGoldWeightGrams || 0) +
        Number(statsResult.totalSilverWeightGrams || 0),
      totalAmount: Number(statsResult.totalAmount || 0),
      activeRecords: Number(statsResult.activeRecords || 0),
      archivedRecords: Number(statsResult.archivedRecords || 0),
      bigRecords: Number(statsResult.bigRecords || 0),
      currentMonthRecords: Number(statsResult.currentMonthRecords || 0),
      currentMonthWeight:
        Number(statsResult.currentMonthGoldWeight || 0) +
        Number(statsResult.currentMonthSilverWeight || 0),
      currentMonthAmount: Number(statsResult.currentMonthAmount || 0),
      currentMonthGold: Number(statsResult.currentMonthGold || 0),
      currentMonthSilver: Number(statsResult.currentMonthSilver || 0),
      currentMonthBoth: Number(statsResult.currentMonthBoth || 0),
      previousMonthRecords: Number(statsResult.previousMonthRecords || 0),
      previousMonthWeight:
        Number(statsResult.previousMonthGoldWeight || 0) +
        Number(statsResult.previousMonthSilverWeight || 0),
      previousMonthAmount: Number(statsResult.previousMonthAmount || 0),
      currentYearRecords: Number(statsResult.currentYearRecords || 0),
      currentYearWeight:
        Number(statsResult.currentYearGoldWeight || 0) +
        Number(statsResult.currentYearSilverWeight || 0),
      currentYearAmount: Number(statsResult.currentYearAmount || 0),
      previousYearRecords: Number(statsResult.previousYearRecords || 0),
      previousYearWeight:
        Number(statsResult.previousYearGoldWeight || 0) +
        Number(statsResult.previousYearSilverWeight || 0),
      previousYearAmount: Number(statsResult.previousYearAmount || 0),
      // Returned records stats
      totalReturnedRecords: Number(statsResult.totalReturnedRecords || 0),
      totalReturnedGoldCount: Number(statsResult.totalReturnedGoldCount || 0),
      totalReturnedSilverCount: Number(
        statsResult.totalReturnedSilverCount || 0
      ),
      totalReturnedBothCount: Number(statsResult.totalReturnedBothCount || 0),
      totalReturnedAmount: Number(statsResult.totalReturnedAmount || 0),
      totalReturnedWeightGrams:
        Number(statsResult.totalReturnedGoldWeightGrams || 0) +
        Number(statsResult.totalReturnedSilverWeightGrams || 0),
    };

    // Calculate trends (percentage changes)
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const monthlyTrends = {
      records: calculateTrend(
        stats.currentMonthRecords,
        stats.previousMonthRecords
      ),
      weight: calculateTrend(
        stats.currentMonthWeight,
        stats.previousMonthWeight
      ),
      amount: calculateTrend(
        stats.currentMonthAmount,
        stats.previousMonthAmount
      ),
    };

    const yearlyTrends = {
      records: calculateTrend(
        stats.currentYearRecords,
        stats.previousYearRecords
      ),
      weight: calculateTrend(stats.currentYearWeight, stats.previousYearWeight),
      amount: calculateTrend(stats.currentYearAmount, stats.previousYearAmount),
    };

    // Get 3 most recent records (excluding returned items)
    const recentRecords = await RecordModel.findAll({
      where: { isReturned: false },
      limit: 3,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'slNo',
        'date',
        'name',
        'fatherName',
        'street',
        'place',
        'goldWeightGrams',
        'silverWeightGrams',
        'itemType',
        'itemCategory',
        'amount',
        'interest',
        'mobile',
        'personImageUrl',
        'itemImageUrl',
        'createdAt',
        // Calculate total weight using Sequelize literal
        [
          literal(
            'COALESCE("goldWeightGrams", 0) + COALESCE("silverWeightGrams", 0)'
          ),
          'totalWeight',
        ],
      ],
    });

    // Additional insights
    const averageWeight =
      stats.totalRecords > 0 ? stats.totalWeightGrams / stats.totalRecords : 0;
    const averageAmount =
      stats.totalRecords > 0 ? stats.totalAmount / stats.totalRecords : 0;

    return NextResponse.json({
      stats: {
        overview: {
          totalRecords: stats.totalRecords,
          totalGoldCount: stats.totalGoldCount,
          totalSilverCount: stats.totalSilverCount,
          totalBothCount: stats.totalBothCount,
          totalGoldWeight: stats.totalGoldWeight,
          totalSilverWeight: stats.totalSilverWeight,
          totalGoldAmount: stats.totalGoldAmount,
          totalSilverAmount: stats.totalSilverAmount,
          totalWeightGrams: stats.totalWeightGrams,
          totalAmount: stats.totalAmount,
          averageWeight,
          averageAmount,
        },
        returned: {
          totalRecords: stats.totalReturnedRecords,
          totalGoldCount: stats.totalReturnedGoldCount,
          totalSilverCount: stats.totalReturnedSilverCount,
          totalBothCount: stats.totalReturnedBothCount,
          totalAmount: stats.totalReturnedAmount,
          totalWeightGrams: stats.totalReturnedWeightGrams,
        },
        categories: {
          active: stats.activeRecords,
          archived: stats.archivedRecords,
          big: stats.bigRecords,
        },
        currentMonth: {
          records: stats.currentMonthRecords,
          weight: stats.currentMonthWeight,
          amount: stats.currentMonthAmount,
          goldCount: stats.currentMonthGold,
          silverCount: stats.currentMonthSilver,
          bothCount: stats.currentMonthBoth,
        },
        trends: {
          monthly: monthlyTrends,
          yearly: yearlyTrends,
        },
      },
      recentRecords,
    });
  } catch (err) {
    console.error('Dashboard stats error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
});
