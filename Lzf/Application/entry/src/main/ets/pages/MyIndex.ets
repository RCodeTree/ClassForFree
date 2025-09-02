import cloud from '@hw-agconnect/cloud';

@Entry
@Component
struct MyIndex {
  @State message: string = 'Hello World';

  build() {
    Column() {
      Button('调用云函数')
        .fontSize(30)
        .onClick(async () => {
          const result = await cloud.callFunction({
            name: 'traffic-sign-detect',
            version: '$latest',
            params: { name: '李华' }
          })

          this.message = result.getValue().desc
        })

      Text(this.message)
        .fontSize(20)
    }
  }
}