'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { HeaderMenu } from './header-menu'
import { models } from 'powerbi-client';
import { isMobile } from 'react-device-detect';
import { PowerBIEmbed } from 'powerbi-client-react';
import Education from './education'
import { Embed } from 'embed'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const [report, setReport] = useState<Report>();

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  const [currentPage, setCurrentPage] = useState('chat');

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className='menu flex'
      >
        <HeaderMenu currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
      {currentPage === 'chat' ? 
        <div>
          <div
            className={cn('pb-[200px] pt-10', className)}
            ref={messagesRef}
          >
            {messages.length ? (
              <ChatList messages={messages} isShared={false} session={session} />
            ) : (
              <EmptyScreen />
            )}
            <div className="w-full h-px" ref={visibilityRef} />
          </div>
          <ChatPanel
            id={id}
            input={input}
            setInput={setInput}
            isAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
          />
        </div> 
        : currentPage === 'dashboard' ?
          <div className='dashboard-container'>
            <PowerBIEmbed
              embedConfig = {{
                type: 'report',
                id: 'dcae53e1-a703-4ff6-b6d6-3cfc5c794f0b',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=dcae53e1-a703-4ff6-b6d6-3cfc5c794f0b&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUVBU1QyLUQtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d',
                accessToken: 'H4sIAAAAAAAEAB3Tt86kVgBA4Xf5WywBw5AsbUFOA1ziAB0554zld_eu-1N90vnnB8R3N8bZz98_UXhHYqBjcEexb10IcoW6PneVEsM1OPoXAxmpMgILiKQH7DdKXupxphY6W-VNdRrJODSAOsbIHcs8qqFPvYIkCMvIFtOO5XfNKAj8QtjrO050vC048wLKgdsHVGokWD4kn69oXbhl8CLch4GGqYuKZwuyq2qcVC9hvmnylawbI9d1wi8VV97CrnHKtR2a6WINbzq6jAmKU1zFMkFKIXo3UwXLq_zKoOUVuZDFGLIPqVzzFczbiFQgkPk9Gu8QhgNCMuAWEk3rekC6z2aLBxisf1P4YCn7nKWZhyLJ1BzZ6hIIpWvCBF6gOhQjBBKi6uWAEHz2OfVYOuQnDMZVh4y6C1u6P1o3eQKKeMe0X32e3rctvBh3c2L8yjr8qkYpmSorkmAmXhgUEotCUOg4yl6KX6NOW_a-dw_8dbAOv3JfEbYQvzKB7aqFCrYheHKiLOeqdoGDy1SkkG_eJSJQN5-T0UoRpRIrfeoOMfSSMHsH1GzwaXUaW77CdcDEkp7F--5pp5q9NtJQymkHQzJz5nrwIe2kHWPR3Mc6acNPPP3oWKrnzSb0dAxFVtak_Bw61RVP2bzAKubpkY5EjOpp_XI2N_75hNg9DgYhrWnAwY7Zg1O1oBCHrwDlQ5d0-2F7QBjQXTQhoNYkNG1l2EYk3dyw_ONMx_QKosbut_RU7deE8IXZs3lKkEkR658JfXsN7_DCKxvgpUgCwf6QjHpD40kAm26_Gw9L2Xa_pcddw82BhS30v_wwX1jaTIeX5Fi-H3KckwllYFjyhVoX-XRBcdhC1nbWrA6cNz9mqH3sT2nzcD8NHzI_3nrn7bbcuCyatBsnd-pp__z1wy33tI1afv_eyVElYerQVo6GpSCRwc6XKbGWG8kjVEHJWAf0wfpdPbArSfuHh104zrNdBPf9toyncsD4Tu3AvJGSa4xA3yYqjfFGSMFqJGApWEJJtqKhBYxZl8ALgW8QYMozXeHycS09nqw0PNfDUI_EjMCtSp2NQ5R0rQxWbdYG7bjuh8NbLRbNtZiFIP4-2PIWkYELiMOoG0SN6jN82Y0DdETW2GlLxYIpAorZ8NtF8c0jxEiUdjE_9gUa1CjVUWhXcCyLd0TV5ktjwzo-UkeZEw7Z4kyPiWKFiw5l3JhDardtG1rt-OWbL6x2-U2uQogtT9LvzSWh6z1KRtIMG_LI2K85WWQojJlfv_4w31OVL4r_W3mMT4ZlkV45zR7tE3wRK7sv_6-cuhzibV_y31koHtU3mNtcolNQ1huAo8SS70Zsm_04GioG0vX0U56TGfcN0tmY9gcH05i-kYNtZl5h971SdFY9-qmrqwuPLsAbI9nHYS5_3W0XNrtJRlwFZdxA0Vdb9HffB58a7ORxKmHcohzXBwuowny6GKiWx7PQwSzKr4XfpIJaMvGKFhWspsqESTtLsBjaH966sjB7banU7skbuQd0g_0t5nLuWdw1eQNsSw2nr_Z3FbYVNtbc-Art-Nrt0uW6SYstRaYETCcv-l7hXEP90-zmUP2uu18WYFqil4IHQ3CXOzSnCJdl52rSQjqYyJE9U7qHjt3TOVNDh2jRrsME-iqNs0fipjeFf5j__Q_apzKdQgYAAA==.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUVBU1QyLUQtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImV4cCI6MTcyNDYyNzIzMSwiYWxsb3dBY2Nlc3NPdmVyUHVibGljSW50ZXJuZXQiOnRydWV9',
                tokenType: models.TokenType.Embed,
                settings: {
                  layoutType: isMobile ? models.LayoutType.MobilePortrait : models.LayoutType.Master,
                  panes: {
                    filters: {
                      expanded: false,
                      visible: false
                    }
                  },
                  background: models.BackgroundType.Transparent,
                  navContentPaneEnabled: false
                }
              }}
              eventHandlers = {new Map([
                ['loaded', () => console.log('Report loaded')],
                ['rendered', () => console.log('Report rendered')],
                ['error', (event: any) => console.log(event.detail)],
                ['visualClicked', () => console.log('Visual clicked')],
                ['pageChanged', (event: any) => console.log(event)]
              ])}
              cssClassName = { "bi-dashboard" }
            />
          </div>
        : <Education />
      }
    </div>
  )
}
