import { CommonService } from 'src/core/common/common.service';

export function autoSlug(
  object: any,
  options: { field: string } = { field: 'title' },
) {
  const { field } = options;
  if (object[field]) {
    const commonService = new CommonService();
    object.slug = commonService.toSlug(object[field]);
  }
}
