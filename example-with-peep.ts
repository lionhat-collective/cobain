
import { cobain } from './cobain.ts'
import { div, peep } from 'https://raw.githubusercontent.com/lionhat-collective/peep/master/peep.ts'

const staffMember = ({ name, role }: { name: string, role: string }) => div(
    div(`Name: ${name}`),
    div(`Role: ${role.toUpperCase()}`),
)

const test = peep(component => {
    let x = Math.round(Math.random())

    component(
        div(
            div("Hello world"),
            "Heya"
        )
        .class("hello-world")
    )

    if (x) {
        component(
            div(
                div("Hello worldx2"),
                "Heyax2"
            ).class("hello-worldx2")
        )
    }

    for (let i = 0; i < 10; i++) {
        component(
            staffMember({ name: `Staff member ${i}`, role: `${i}` })
        )
    }

    component(
        div("Heyo").class("heyo")
    )
})

const homePage = peep(component => {
    component(
        div(
            div("Home page"),
            test
        )
    )
})

const app = cobain(
    ctx => ctx.req.respond({
        status: 200,
        body: homePage
    })
)({ hostname: '127.0.0.1', port: 3333 })

await app.start()