'use client';

import FormContainer from '@/components/Form/FormContainer';
import FormControlsTop from '@/components/Form/FormControlsTop';
import NumberInputWithIcon from '@/components/Form/NumberInputWithIcon';
import ImportCalculationModal from '@/components/Modals/ImportCalculationModal';
import RenameCalculationModal from '@/components/Modals/RenameCalculationModal';
import SaveCalculationModal from '@/components/Modals/SaveCalculationModal';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { MARKUP_CALCULATIONS_API_URL, MARKUP_CALCULATIONS_QUERY_KEY } from '@/constants/api';
import useDeleteCalculationMutation from '@/hooks/useDeleteCalculationMutation';
import useRenameCalculationMutation from '@/hooks/useRenameCalculationMutation';
import useSaveCalculationMutation from '@/hooks/useSaveCalculationMutation';
import useUpdateCalculationMutation from '@/hooks/useUpdateCalculationMutation';
import {
	deleteCalculation,
	getCalculations,
	renameCalculation,
	saveCalculation,
	updateCalculation,
} from '@/lib/queryFns/calculations';
import { calculationNameSchema, markupCalculatorSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { MarkupCalculation } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CalculationReport from './CalculatationReport';

export interface MarkupReportProps {
	profit: number;
	markup: number;
}

const defaultValues: z.infer<typeof markupCalculatorSchema> = {
	cost: 0,
	salesPrice: 0,
};

const calculateMarkup = (formData: z.infer<typeof markupCalculatorSchema>) => {
	const { cost, salesPrice } = formData;

	const profit = salesPrice - cost;
	const markup = (profit / cost) * 100;

	return { profit, markup };
};

const Calculator = () => {
	const [saveModalOpen, setSaveModalOpen] = useState(false);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [renameModalOpen, setRenameModalOpen] = useState(false);
	const [activeCalculation, setActiveCalculation] = useState<MarkupCalculation | null>(null);
	const [report, setReport] = useState<MarkupReportProps | null>(null);

	const { status: sessionStatus } = useSession();

	const form = useForm<z.infer<typeof markupCalculatorSchema>>({
		resolver: zodResolver(markupCalculatorSchema),
		defaultValues,
	});

	const {
		data: calculations,
		isLoading: isCalculationsLoading,
		isFetching,
	} = useQuery<MarkupCalculation[] | null>({
		queryKey: [MARKUP_CALCULATIONS_QUERY_KEY],
		queryFn: () => getCalculations(MARKUP_CALCULATIONS_API_URL),
		staleTime: 1_000 * 60 * 10, // 10 minutes
		enabled: sessionStatus === 'authenticated',
	});

	const { mutate: saveMutation } = useSaveCalculationMutation<
		MarkupCalculation,
		z.infer<typeof markupCalculatorSchema>
	>(MARKUP_CALCULATIONS_QUERY_KEY, setActiveCalculation, saveCalculation, setSaveModalOpen);

	const { mutate: deleteMutation } = useDeleteCalculationMutation<
		MarkupReportProps,
		MarkupCalculation
	>(
		MARKUP_CALCULATIONS_QUERY_KEY,
		activeCalculation,
		setActiveCalculation,
		setReport,
		deleteCalculation
	);

	const { mutate: renameMutation } = useRenameCalculationMutation<MarkupCalculation>(
		MARKUP_CALCULATIONS_QUERY_KEY,
		setActiveCalculation,
		setRenameModalOpen,
		renameCalculation
	);

	const { mutate: updateMutation } = useUpdateCalculationMutation<
		z.infer<typeof markupCalculatorSchema>,
		MarkupCalculation
	>(MARKUP_CALCULATIONS_QUERY_KEY, setActiveCalculation, updateCalculation);

	const onCalculate = (values: z.infer<typeof markupCalculatorSchema>) => {
		setReport(calculateMarkup(values));
	};

	const resetForm = () => {
		setReport(null);
		toast.success('Form cleared');

		form.reset(defaultValues);
	};

	const handleSaveUpdateStart = () => {
		if (activeCalculation) {
			// Only update if the form data has changed
			if (JSON.stringify(activeCalculation.formData) !== JSON.stringify(form.getValues())) {
				updateMutation({
					apiUrl: MARKUP_CALCULATIONS_API_URL,
					updatedCalculation: { ...activeCalculation, formData: form.getValues() },
				});
			} else {
				toast.success('Calculation updated');
			}
		} else {
			setSaveModalOpen(true);
		}
	};

	const closeSaveModal = () => {
		setSaveModalOpen(false);
	};

	const handleSave = (data: z.infer<typeof calculationNameSchema>) => {
		saveMutation({
			apiUrl: MARKUP_CALCULATIONS_API_URL,
			name: data.name,
			formData: form.getValues(),
		});
	};

	const handleRename = (data: z.infer<typeof calculationNameSchema>) => {
		if (!activeCalculation) return;
		// Only update if the name has changed
		if (activeCalculation.name === data.name) {
			setRenameModalOpen(false);
		} else {
			renameMutation({
				apiUrl: MARKUP_CALCULATIONS_API_URL,
				updatedCalculation: { ...activeCalculation, name: data.name },
			});
		}
	};

	const handleDelete = (id: string) => {
		deleteMutation({ apiUrl: MARKUP_CALCULATIONS_API_URL, id });
	};

	const handleClose = () => {
		setActiveCalculation(null);
		setReport(null);
		form.reset(defaultValues);
		toast.success('Calculation closed');
	};

	const handleImport = (calculation: MarkupCalculation) => {
		const { formData, name } = calculation;

		setActiveCalculation(calculation);
		toast.success(`${name} imported`);
		setImportModalOpen(false);
		setReport(calculateMarkup(formData));

		form.reset(formData);
	};

	return (
		<>
			<SaveCalculationModal
				isOpen={saveModalOpen}
				handleClose={closeSaveModal}
				handleSave={handleSave}
			/>

			<ImportCalculationModal
				isOpen={importModalOpen}
				setImportModalOpen={setImportModalOpen}
				handleDelete={handleDelete}
				calculations={calculations}
				isLoading={isCalculationsLoading || isFetching}
				handleImport={handleImport}
			/>

			<RenameCalculationModal
				isOpen={renameModalOpen}
				handleClose={() => setRenameModalOpen(false)}
				handleRename={handleRename}
				activeCalculation={activeCalculation}
			/>

			<FormContainer>
				<FormControlsTop
					reset={resetForm}
					saveUpdateStart={handleSaveUpdateStart}
					activeCalculation={activeCalculation}
					closeCalculation={handleClose}
					importStart={() => setImportModalOpen(true)}
					renameStart={() => setRenameModalOpen(true)}
				/>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onCalculate)} className="space-y-4">
						<div className="flex flex-col xs:flex-row gap-4">
							<FormField
								control={form.control}
								name="cost"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Cost</FormLabel>

										<FormControl>
											<NumberInputWithIcon
												{...field}
												iconType="currency"
												name="cost"
												onBlur={(e) => {
													if (e.target.value === '') {
														form.setValue('cost', 0);
													}
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="salesPrice"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Sales Price</FormLabel>

										<FormControl>
											<NumberInputWithIcon
												{...field}
												iconType="currency"
												type="number"
												onBlur={(e) => {
													if (e.target.value === '') {
														form.setValue('salesPrice', 0);
													}
												}}
												name="salesPrice"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit" className="w-full">
							Calculate
						</Button>
					</form>
				</Form>
			</FormContainer>

			{report && <CalculationReport report={report} />}
		</>
	);
};

export default Calculator;
