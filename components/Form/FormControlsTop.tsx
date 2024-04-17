import { FileDown, RotateCw, Save, SquarePen, X } from 'lucide-react';
import { ImSpinner8 } from 'react-icons/im';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface FormControlsTopProps {}

const FormControlsTop = ({}: FormControlsTopProps) => {
	const saveLoading = false;

	return (
		<>
			<div className="flex flex-wrap justify-between items-center gap-1 pb-1">
				<div className="flex flex-wrap gap-1 items-center order-1 xs:order-none w-full xs:w-auto justify-between xs:justify-normal">
					<p className="mr-1">calculation name</p>

					<div className="flex gap-1">
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<SquarePen className="h-4 w-4" aria-hidden />

							<span className="sr-only">Rename calculation</span>
						</Button>

						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:text-destructive"
						>
							<X className="h-4 w-4" aria-hidden />

							<span className="sr-only">Close calculation</span>
						</Button>
					</div>
				</div>

				<div className="flex flex-wrap gap-1 justify-end xs:justify-normal w-full xs:w-auto">
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<FileDown className="h-4 w-4" aria-hidden />

						<span className="sr-only">Import calculation</span>
					</Button>

					<Button variant="ghost" size="icon" className="h-8 w-8">
						{saveLoading ? (
							<ImSpinner8 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" aria-hidden />
						)}

						<span className="sr-only">Save calculation</span>
					</Button>

					<Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
						<RotateCw className="h-4 w-4 " />

						<span className="sr-only">Reset calculator</span>
					</Button>
				</div>
			</div>

			<Separator className="h-[1.6px] mb-3" />
		</>
	);
};

export default FormControlsTop;
