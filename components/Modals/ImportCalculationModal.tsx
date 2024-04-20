'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MarkupCalculation } from '@prisma/client';
import { FileDown, Trash } from 'lucide-react';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

interface ImportCalculationModalProps {
	isOpen: boolean;
	setImportModalOpen: Dispatch<SetStateAction<boolean>>;
	calculations?: MarkupCalculation[] | null;
	isLoading: boolean;
	handleDelete: (id: string) => void;
	handleImport: (calculation: MarkupCalculation) => void;
}

const ImportCalculationModal = ({
	isOpen,
	setImportModalOpen,
	calculations,
	isLoading,
	handleDelete,
	handleImport,
}: ImportCalculationModalProps) => {
	const handleDeleteCalculation = (id: string) => {
		handleDelete(id);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => setImportModalOpen(open)}>
			<DialogContent className="p-0">
				<DialogHeader className="p-6 pb-0">
					<DialogTitle>Import Calculation</DialogTitle>
				</DialogHeader>

				<ScrollArea className="min-h-[272px] max-h-[min(50svh,512px)] p-6 pt-0">
					{isLoading ? (
						<div className="flex flex-col gap-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={`markup-calculation-${i}`} className="h-8" />
							))}
						</div>
					) : calculations && calculations.length > 0 ? (
						<ul className="flex flex-col">
							{calculations.map((calculation) => (
								<Fragment key={calculation.id}>
									<li className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-between">
										<div className="text-ellipsis whitespace-nowrap overflow-hidden w-44 xs:w-auto">
											{calculation.name}
										</div>

										<div className="flex gap-2 pr-1">
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														onClick={() => handleImport(calculation)}
														variant="ghost"
														size="icon"
														className="h-8 w-8"
													>
														<FileDown className="h-4 w-4" aria-hidden />

														<span className="sr-only">
															Import calculation
														</span>
													</Button>
												</TooltipTrigger>

												<TooltipContent>
													<p>Import calculation</p>
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														onClick={() =>
															handleDeleteCalculation(calculation.id)
														}
														variant="ghost"
														size="icon"
														className="h-8 w-8 hover:text-destructive"
													>
														<Trash className="h-4 w-4" aria-hidden />

														<span className="sr-only">
															Delete Calculation
														</span>
													</Button>
												</TooltipTrigger>

												<TooltipContent>
													<p>Delete Calculation</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</li>

									<Separator className="h-[1px] my-2" />
								</Fragment>
							))}
						</ul>
					) : (
						<p>You dont have any saved calculations yet.</p>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default ImportCalculationModal;
