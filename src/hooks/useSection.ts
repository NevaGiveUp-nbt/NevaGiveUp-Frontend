import { ICreateSection, IUpdateSection } from "@/schemas/section.schema";
import { SectionService } from "@/services/section";
import { SectionTypeResponse } from "@/types/learning/learning.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSections(courseId: string) {
    const queryInfo = useQuery({
        queryKey: ['sections', courseId],
        queryFn: async () => {
            const result = await SectionService.getAllSections(courseId);
            return result;
        },
        staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
    })
    return queryInfo;
}

export function useReorderSections(courseId: string) {
    const queryClient = useQueryClient();
    const queryKey = ['sections', courseId];
    return useMutation({
        mutationFn: (sectionIds: number[]) => SectionService.reorderSections(courseId, sectionIds),
        onMutate: async (sectionIds) => { //onMutate sẽ chạy trước khi req được gửi -> optimistic update
            await queryClient.cancelQueries({ queryKey }); //Hủy các lần refetch đang chạy. Nếu không, một refetch cũ trả về sau có thể ghi đè lên thứ tự mới bạn vừa đặt, làm giao diện bị nhấp nháy về thứ tự cũ.
            const previous = queryClient.getQueryData<SectionTypeResponse[]>(queryKey); //chụp lại bản sao để nếu lỗi thì khôi phục
            queryClient.setQueryData<SectionTypeResponse[]>(queryKey, (old) =>
                old //nếu có dữ liệu old
                    ? (sectionIds
                        .map((id) => old.find((s) => s.id === id)) //duyệt từng Id trong thứ tự mới và lấy ra obj chương
                        .filter(Boolean) as SectionTypeResponse[]) //loại bỏ những phần tử undefined để mảng k chứa giá trị rỗng
                    : old, //nếu không có dữ liệu thì giữ nguyên
            ); // sắp xếp lại cache theo thứ tự mới
            return { previous };
        },
        onError: (error: any, _vars, ctx) => {
            queryClient.setQueryData(queryKey, ctx?.previous); //khôi phục lại ban đầu nếu lỗi 
            toast.error(error?.message || "Lỗi khi sắp xếp chương");
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }), //chạy cuối cùng nếu có lỗi/thành công thì nó đánh dấu cache=> cũ để react query tải lại
    });
}

export function useCreateSection() {
    const queryClient = useQueryClient();
    const mutationInfo = useMutation({
        mutationFn: async (sectionData: ICreateSection) => {
            const result = await SectionService.createSection(sectionData);
            return result;
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Tạo chương mới thành công");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    return mutationInfo;
}


export function useUpdateSection() {
    const queryClient = useQueryClient();
    const mutationInfo = useMutation({
        mutationFn: async ({ sectionId, sectionData }: { sectionId: number, sectionData: IUpdateSection }) => {
            const result = await SectionService.updateSection(sectionId, sectionData);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Cập nhật chương của khoá học thành công");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    return mutationInfo;
}

export function useDeleteSection() {
    const queryClient = useQueryClient();
    const mutationInfo = useMutation({
        mutationFn: async (sectionId: number) => {
            const result = await SectionService.deleteSection(sectionId);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sections'] });
            toast.success("Xoá chương của khoá học thành công");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    return mutationInfo;
}
