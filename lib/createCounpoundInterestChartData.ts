import { ICompoundInterestFormData } from '@/types/calculations';

export interface ICompoundInterestChartData {
	month: number;
	totalPrincipal: number;
	totalContributions: number;
	totalInterest: number;
	totalAbsInterest: number;
}

export const createCounpoundInterestChartData = (
	formData: ICompoundInterestFormData
): Promise<ICompoundInterestChartData[]> => {
	return new Promise((resolve) => {
		const {
			startingBalance,
			interestRate,
			compoundFrequency,
			duration,
			durationMultiplier,
			contribution,
			contributionMultiplier,
			contributionFrequency,
		} = formData;

		// Compounded Interest for Principal
		// CI = P(1 + r/n)^(nt)

		// Future Value of a Series
		// FV = PMT * (((1 + r / n) ** (n * t) - 1) / (r / n))

		// Total amount
		// T = CI + FV

		// Where:
		// PMT = addition freq / compound freq
		// CI = the future value of the investment/loan, including interest
		// P = Principal investment amount (the initial deposit or loan amount)
		// r = Annual interest rate (decimal)
		// n = Compound frequency per year
		// t = Investment time in years

		// time in months
		const tm = duration * durationMultiplier;

		const depositting = contributionMultiplier > -1;

		const _chartData: ICompoundInterestChartData[] = [];

		const PMT =
			contributionMultiplier * contribution * (contributionFrequency / compoundFrequency);
		const P = +startingBalance;
		const r = interestRate / 100;
		const n = compoundFrequency;

		// Decreasable pricipal for when depositting
		let p = +startingBalance;

		for (let i = 0; i <= tm; i++) {
			// Spread deposits/withdrawals evenly depending on deposits/withdrawals frequency
			let pmt = (contributionFrequency / 12) * (contributionMultiplier * contribution);
			let CI_i = P * (1 + r / n) ** (n * (i / 12));
			let FV_i = PMT * (((1 + r / n) ** (n * (i / 12)) - 1) / (r / n));
			let T_i = CI_i + FV_i;

			const additions = i * pmt;
			const interest = T_i - (P + additions);
			const month = i;
			const principal = P;

			const entry: ICompoundInterestChartData = {} as ICompoundInterestChartData;

			entry.totalContributions = additions;

			entry.month = month;

			if (depositting) {
				entry.totalPrincipal = principal;

				entry.totalInterest = interest;
			} else {
				// Dont withdraw on first iteration
				if (i > 0) {
					p += pmt;
				}
				// when principal is depleted value is 0
				const offsetPrincipal = p > 0 ? p : 0;
				// The remainder value when principal is depleted
				const remainder = p + pmt > P ? 0 : p;

				// Dont show negative pricipal & skip first iteration
				entry.totalPrincipal = p >= 0 ? p : 0;

				// Substract from interest when pricipal is depleted & skip first iteration

				entry.totalInterest = i > 0 ? interest + remainder - offsetPrincipal : 0;
			}

			// This array is for table
			entry.totalAbsInterest = interest;

			_chartData.push(entry);
		}

		resolve(_chartData);
	});
};
