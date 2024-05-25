import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { numberRegex } from '@/core/utils/models/common.model';
import { TPopulate, TQuery } from '@/core/utils/models/query.model';
import * as qs from 'qs';
import settings from '@/settings.json';
import * as pluralize from 'pluralize';
import { CommonService } from '@/core/common/common.service';
@Injectable()
export class QueryService {
  constructor(private commonService: CommonService) {}
  private populateMerge = (fieldSplit: any[], object: any) => {
    let exists = false;
    for (const key in fieldSplit) {
      if (fieldSplit[key]['path'] === object['path']) {
        if (object['populate']) {
          let merge: any[] = [];
          for (const item of object['populate']) {
            merge.push(item);
          }
          if (fieldSplit[key]['populate']) {
            fieldSplit[key]['populate'].push(...merge);
          } else {
            fieldSplit[key]['populate'] = merge;
          }
        }
        if (object['select']) {
          if (fieldSplit[key]['select']) {
            fieldSplit[key]['select'] =
              fieldSplit[key]['select'] + ' ' + object['select'];
          } else fieldSplit[key]['select'] = object['select'];
        }
        exists = true;
      }
    }
    if (!exists) fieldSplit = [...fieldSplit, object];
    return fieldSplit;
  };

  private handleField(fields: string) {
    let fieldHandle: any = {},
      selectObj: any,
      fieldSplit: any[] = [];

    if (fields) {
      //tách fields ra bằng dấu , để phân tích
      const fieldArr = fields.split(',').filter((item: string) => item !== '');

      for (const field of fieldArr) {
        //chạy qua từng field, nếu field có dấu . tức là đang có field muốn tham chiếu
        if (field.includes('.')) {
          const nestedFieldArr = field
            .split('.')
            .filter((item: string) => item !== '');

          //lấy value cuối cùng trong chuỗi
          let removeLastEl = nestedFieldArr.slice(0, -1).join('.');
          let lastEl = nestedFieldArr.slice(-1).join();

          //check nếu có dấu - ở đầu thì phải đưa về value chứ ko dc nằm ở key
          if (removeLastEl.startsWith('-')) {
            removeLastEl = removeLastEl.replace('-', '');
            lastEl = '-' + lastEl;
          }

          //tách thành dạng {'a.b': c}
          if (!fieldHandle[removeLastEl])
            fieldHandle = {
              ...fieldHandle,
              [removeLastEl]: lastEl,
            };
          else {
            if (
              !fieldHandle[removeLastEl].includes('*') ||
              lastEl.includes('-')
            )
              fieldHandle[removeLastEl] =
                fieldHandle[removeLastEl] + ' ' + lastEl;
          }
        }
        //nếu không có tham chiếu thì add vào select chứ ko dùng poppulate
        else
          selectObj = {
            ...selectObj,
            [field]: 1,
          };
      }
      for (let [key, value] of Object.entries(fieldHandle)) {
        const keySplit = key.split('.').filter((item: string) => item !== '');
        let populateObj: TPopulate;
        if (keySplit.length > 1) {
          populateObj = keySplit.reduceRight(
            (prev: TPopulate, cur: string, index) => {
              return {
                path: cur,
                ...(index + 1 === keySplit.length
                  ? {
                      ...((value as string).includes('-')
                        ? {
                            ...((value as string).includes('*')
                              ? {
                                  select: (value as string).replace('*', ''),
                                }
                              : {
                                  select: value as string,
                                }),
                          }
                        : {
                            ...(value !== '*' && {
                              select: value as string,
                            }),
                          }),
                    }
                  : { populate: [prev] }),
              };
            },
            { populate: {} },
          );
        } else {
          populateObj = {
            path: key,
            ...((value as string).includes('-')
              ? {
                  ...((value as string).includes('*')
                    ? {
                        select: (value as string).replace('*', ''),
                      }
                    : {
                        select: value as string,
                      }),
                }
              : {
                  ...(value !== '*' && {
                    select: value as string,
                  }),
                }),
          };
        }
        //kiểm tra path đã tồn tại trong mảng chưa, nếu rồi thì phải merge các object cùng path với nhau

        fieldSplit = this.populateMerge(fieldSplit, populateObj);
      }
      for (const field of fieldArr) {
        if (field === '*') {
          for (const key in selectObj) {
            if (!key.includes('-')) {
              delete selectObj[key];
            }
          }
          break;
        }
      }

      for (const item of fieldSplit) {
        if (item['select']?.includes('*')) delete item['select'];
      }
    }

    return {
      populate: fieldSplit,
      select: selectObj,
    };
  }

  private handleFilter(object: object) {
    let result: typeof object = {};
    //Chạy qua điều kiện của object
    for (const key in object) {
      //nếu là mảng
      if (Array.isArray(object[key])) {
        for (const condition of object[key]) {
          if (result[key]) {
            result[key] = [...result[key], this.handleFilter(condition)];
          } else {
            result = {
              [key]: [this.handleFilter(condition)],
            };
          }
        }
      } else {
        //nếu là object thì check text search để đưa về đúng trường cần tìm
        let isTextSearch = false;
        for (const field of settings.TEXT_SEARCH) {
          const keySplitArr = key.split('.').filter((x) => x !== '');
          const removelastKeySplit = keySplitArr.slice(0, -1).join('.');
          const lastKeySplit = keySplitArr.slice(-1).join();

          if (key === field || lastKeySplit === field) {
            for (const compareKey in object[key]) {
              result = {
                [`${
                  removelastKeySplit ? removelastKeySplit + '.' : ''
                }${field}NonAccented`]: {
                  //compare key sử dụng quy tắc của mongodb, ví dụ như $eq, $in, $regex...
                  [compareKey]: this.commonService.toNonAccented(
                    object[key][compareKey],
                  ),
                },
              };
            }
            isTextSearch = true;
            break;
          }
        }
        //
        if (!isTextSearch) {
          //xem xét nếu đang so sánh bằng _id thì phải loại bỏ _id đi để tăng hiệu năng
          let newKey = key;
          const keySplitArr = key.split('.').filter((x) => x !== '');
          if (keySplitArr.includes('_id') && keySplitArr.length > 1)
            newKey = keySplitArr.filter((x) => x !== '_id').join('.');
          result = {
            [newKey]: this.stringToNumberObject(object[key]),
          };
        }
      }
    }
    return result;
  }

  private toArray = (string: string) => {
    let result = [];
    const stringSplitArr = string.split(',').filter((x) => x !== '');
    for (const stringSplit of stringSplitArr) {
      if (numberRegex.test(stringSplit)) {
        result.push(+stringSplit);
      } else result.push(stringSplit);
    }
    return result;
  };

  //hàm đưa giá trị cuối cùng của object về thành number nếu nó thực sự là number
  private stringToNumberObject(object: object | string) {
    if (typeof object === 'string') {
      return +object;
    }
    for (let key in object) {
      if (typeof object[key] !== 'object') {
        return {
          [key]:
            key === '$in' || key === '$nin' || key === '$all'
              ? numberRegex.test(object[key])
                ? +object[key]
                : this.toArray(object[key])
              : numberRegex.test(object[key])
              ? +object[key]
              : object[key],
        };
      }
      return {
        [key]:
          key === '$in' || key === '$all'
            ? this.toArray(this.stringToNumberObject(object[key]))
            : this.stringToNumberObject(object[key]),
      };
    }
  }

  private async handleFind<T>(model: Model<T>, query: TQuery, _id: any) {
    let { fields } = query;
    let selectObj: any,
      populate: any[] = [],
      result: any[];

    if (fields) {
      populate = this.handleField(fields).populate;
      selectObj = this.handleField(fields).select;
    }
    try {
      if (_id && Array.isArray(_id))
        result = await model
          .find({ _id: { $in: _id } })
          .select(selectObj)
          .populate(populate);
      else if (_id)
        result = await model.findById(_id).select(selectObj).populate(populate);
      else
        result = await model.find().select(selectObj).populate(populate).lean();
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  private extractNestedObject = (object: any, resultArray: any[]) => {
    const compareKey = ['$or', '$and']; //bởi vì $or và $and đều là mảng nên có thể sử dụng chung logic
    //kiểm tra xem object có phải object ko
    if (typeof object === 'object') {
      //kiểm tra có bất kỳ compareKey nào bên trong object hay ko
      let result = '';
      for (const key of compareKey) {
        if (key in object) {
          result = key;
        }
      }

      if (result) {
        //nếu có thì chạy vòng lặp qua key đó, vì cả $and và $or đều là mảng
        for (const item of object[result]) {
          //nếu là object thì thêm vào mảng result
          if (typeof item === 'object') {
            //bên trong object lúc này có thể có compareKey, chúng ta loại bỏ compareKey sau đó add toàn bộ dữ liệu của nó vào mảng kết quả
            let result = false;
            for (const sKey of compareKey) {
              if (sKey in item) {
                resultArray.push(...item[sKey]);
                result = true;
              }
            }

            if (!result) resultArray.push(item);
          }

          //nếu là mảng thì chạy qua và tiếp tục đệ quy
          if (Array.isArray(item)) {
            for (const i of item) {
              this.extractNestedObject(i, resultArray);
            }
          }
        }
      } else {
        resultArray.push(object);
      }
    }
  };

  private handleLookup(array: any[]) {
    let result: any[] = [];
    //bóc tách từng phần tử để phân tích
    for (const item of array) {
      //bên trong này chắc chắn là object và chỉ cần quan tâm đến key của nó
      //nếu trong key của nó có chứa . tức là nó sẽ phải dc lookup
      for (const key in item) {
        if (key.includes('.')) {
          const keySplitArr = key.split('.').filter((x) => x !== '');
          //bóc tách key để phân tích, ví dụ như ở đây sẽ có story và category, sẽ phải lookup đến story và story.category
          //dùng reduceRight chạy qua từ category -> story để tạo đúng path cho nó
          keySplitArr.reduceRight((prev: any, cur: string, index) => {
            if (index !== keySplitArr.length - 1) {
              let as = '';
              for (let x = 0; x < index; x++) {
                as += keySplitArr[x] + '.';
              }
              as += cur;
              const lookup = {
                $lookup: {
                  from: pluralize.plural(cur),
                  localField: as,
                  foreignField: '_id',
                  as,
                },
              };
              //tìm trong result xem có chưa, chưa có thì push vào
              let exists = false;
              for (const i of result) {
                if (i['$lookup']['from'] === pluralize.plural(cur)) {
                  exists = true;
                  break;
                }
              }
              if (!exists) {
                if (index === 0) result.unshift(lookup);
                else result.push(lookup);
              }
            }
          }, null);
        }
      }
    }
    return result;
  }

  async handleQuery<T>(model: Model<T>, query: TQuery, _id?: any) {
    let { fields, filter, page, limit, meta, sort } = query;
    if (!page) page = 1;
    if (!limit) limit = 10;
    if (limit > settings.QUERY.LIMIT)
      throw new Error('Limit không được vượt quá 100');
    if (!sort) sort = '_id';
    let selectObj: any,
      populate: any[] = [],
      result: any[],
      filterObj: object = {},
      total_count: number,
      filter_count: number,
      metaSelect: string[] = [];

    if (fields) {
      populate = this.handleField(fields).populate;
      selectObj = this.handleField(fields).select;
    }
    if (filter)
      filterObj = this.handleFilter(
        qs.parse(qs.stringify(filter), { depth: 10 }),
      );
    if (meta)
      metaSelect = meta.split(',').filter((meta: string) => meta !== '');
    try {
      if (_id && Array.isArray(_id))
        result = await model
          .find({ _id: { $in: _id } })
          .select(selectObj)
          .populate(populate);
      else if (_id)
        result = await model.findById(_id).select(selectObj).populate(populate);
      else
        result = await model
          .find({ ...filterObj })
          .sort(sort)
          .select(selectObj)
          .populate(populate)
          .skip((+page - 1) * +limit)
          .limit(+limit)
          .lean();

      const promises = [];
      for (const meta of metaSelect) {
        if (meta === '*') {
          promises.push(
            model
              .estimatedDocumentCount()
              .then((count) => (total_count = count)),
          );
          if (Object.keys(filterObj).length === 0)
            promises.push(
              model
                .estimatedDocumentCount()
                .then((count) => (filter_count = count)),
            );
          else
            promises.push(
              model
                .countDocuments({ ...filterObj })
                .then((count) => (filter_count = count)),
            );
          break;
        }
        if (meta === 'total_count')
          promises.push(
            model
              .estimatedDocumentCount()
              .then((count) => (total_count = count)),
          );
        if (meta === 'filter_count') {
          if (Object.keys(filterObj).length === 0)
            promises.push(
              model
                .estimatedDocumentCount()
                .then((count) => (filter_count = count)),
            );
          else
            promises.push(
              model
                .countDocuments({ ...filterObj })
                .then((count) => (filter_count = count)),
            );
        }
      }

      if (promises.length > 0) await Promise.all(promises);
    } catch (error) {
      console.log(error);
    }

    const data = {
      data: result ? result : [],
    };
    for (const meta of metaSelect) {
      if (meta === '*') {
        data['meta'] = {
          total_count,
          filter_count,
        };
        break;
      }
      if (meta === 'total_count')
        data['meta'] = { ...data['meta'], total_count };
      if (meta === 'filter_count')
        data['meta'] = { ...data['meta'], filter_count };
    }
    return data;
  }

  private async handleAggregate<T>(model: Model<T>, query: TQuery, _id?: any) {
    let { filter, limit, page, sort } = query;
    let sortArr = [],
      sortObj: any,
      filterObj: any,
      lookupList: any[];

    if (!page) page = 1;
    if (!limit) limit = 10;
    if (sort) {
      sortArr = sort.split(',').filter((x) => x !== '');
      for (const key of sortArr) {
        if (key.startsWith('-')) {
          sortObj = {
            ...sortObj,
            [key.replace('-', '')]: -1,
          };
        } else sortObj = { ...sortObj, [key]: 1 };
      }
    }
    let aggregateArr: any[] = [
      {
        $facet: {
          matchedResults: [],
        },
      },
      {
        $project: {
          matchedResults: 1,
        },
      },
    ];

    if (filter) {
      filterObj = this.handleFilter(
        qs.parse(qs.stringify(filter), { depth: 10 }),
      );
      const result: any[] = [];
      this.extractNestedObject(filterObj, result);
      lookupList = this.handleLookup(result);
      aggregateArr[0].$facet.matchedResults.unshift(...lookupList);
      aggregateArr[0].$facet.matchedResults.push({
        $match: filterObj,
      });
    }

    aggregateArr[0].$facet.matchedResults.push({
      $skip: (+page - 1) * +limit,
    });

    aggregateArr[0].$facet.matchedResults.push({
      $limit: +limit,
    });

    if (sort)
      aggregateArr[0].$facet.matchedResults.push({
        $sort: sortObj,
      });

    const aggregate = await model.aggregate(aggregateArr);

    const result = await this.handleFind(
      model,
      query,
      _id ? _id : aggregate[0].matchedResults,
    );
    const filterCount = await model.find(filterObj).countDocuments();
    const data = {
      data: result,
      ...(filter && {
        filterCount,
      }),
    };
    return data;
  }
}
