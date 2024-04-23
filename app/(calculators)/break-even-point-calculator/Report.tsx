'use client';

import ReportSummaryContainer from '@/components/Form/ReportSummaryContainer';
import ReportGroup from '@/components/Report/ReportGroup';
import useCurrencyStore from '@/hooks/useCurrency';
import { formatCurrency, formatPercentage, getCurrencySymbol } from '@/lib/utils';
import { BreakEvenPointReportProps } from '@/types/calculations';

interface ReportProps {
	report: BreakEvenPointReportProps;
	isLoading?: boolean;
}

const Report = ({ report, isLoading = false }: ReportProps) => {
	const { currency } = useCurrencyStore();

	const {
		fixedCosts,
		pricePerUnit,
		variableCostPerUnit,
		breakEvenPointMoney,
		breakEvenPointUnits,
		contributionMarginMoney,
		contributionMarginPercent,
	} = report;

	return (
		<ReportSummaryContainer>
			<ReportGroup header="Fixed Costs" value={formatCurrency(fixedCosts, currency)} />

			<ReportGroup
				header="Variable Cost Per Unit"
				value={formatCurrency(pricePerUnit, currency)}
			/>

			<ReportGroup
				fullWidth
				header="Price Per Unit"
				value={formatCurrency(variableCostPerUnit, currency)}
			/>

			<ReportGroup
				header="Break Even Point (Unit)"
				value={isFinite(breakEvenPointUnits) ? breakEvenPointUnits.toFixed(2) : 'N/A'}
			/>

			<ReportGroup
				header="Break Even Point Revenue"
				value={
					isFinite(breakEvenPointUnits)
						? formatCurrency(breakEvenPointMoney, currency)
						: 'N/A'
				}
			/>

			<ReportGroup
				header="Contribution Margin %"
				value={formatPercentage(contributionMarginPercent)}
			/>

			<ReportGroup
				header={`Contribution Margin ${getCurrencySymbol(currency)}`}
				value={formatCurrency(contributionMarginMoney, currency)}
			/>
		</ReportSummaryContainer>
	);
};

export default Report;
