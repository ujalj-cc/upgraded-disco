"use client"

import { useState } from "react"

import { useEffect, useRef } from "react"
import { Tree } from "react-d3-tree"

type CustomNodeProps = {
  nodeDatum: any
  toggleNode: () => void
}

const CustomNode = ({ nodeDatum }: CustomNodeProps) => {
  const bgColor =
    nodeDatum.depth === 0
      ? "#f9d5e5"
      : nodeDatum.depth === 1
        ? "#eeeeee"
        : nodeDatum.depth === 2
          ? "#d0e8f2"
          : "#d9f7be"

  return (
    <g>
      <rect width="220" height="80" x="-110" y="-40" rx="5" ry="5" fill={bgColor} stroke="#333" strokeWidth="1" />
      <text fill="#333" strokeWidth="0" x="0" y="-20" textAnchor="middle" fontWeight="bold">
        {nodeDatum.name}
      </text>
      <text fill="#333" strokeWidth="0" x="0" y="0" textAnchor="middle">
        {nodeDatum.attributes?.designation}
      </text>
      <text fill="#333" strokeWidth="0" x="0" y="20" textAnchor="middle" fontSize="12">
        {nodeDatum.attributes?.department}
      </text>
    </g>
  )
}

export default function OrgChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 600,
      })
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 600,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const employeeData = {
    name: "John Doe0 (1)",
    attributes: {
      designation: "CEO/Founder",
      department: "Management",
      empCode: "1",
    },
    children: [
      {
        name: "John Doe1 (37251)",
        attributes: {
          designation: "Vice President",
          department: "Accounts and Finance",
          empCode: "37251",
        },
        children: [
          {
            name: "John Doe3 (37370)",
            attributes: {
              designation: "Finance Manager",
              department: "Accounts and Finance",
              empCode: "37370",
            },
            children: [
              {
                name: "John Doe6 (37359)",
                attributes: {
                  designation: "Finance Executive",
                  department: "Accounts and Finance",
                  empCode: "37359",
                },
              },
              {
                name: "John Doe7 (37324)",
                attributes: {
                  designation: "Commercial Executive",
                  department: "Accounts and Finance",
                  empCode: "37324",
                },
              },
            ],
          },
          {
            name: "John Doe4 (37272)",
            attributes: {
              designation: "Sr. Accounts Executive",
              department: "Accounts and Finance",
              empCode: "37272",
            },
            children: [
              {
                name: "John Doe8 (37333)",
                attributes: {
                  designation: "Account Executive",
                  department: "Accounts and Finance",
                  empCode: "37333",
                },
              },
              {
                name: "John Doe9 (37345)",
                attributes: {
                  designation: "Account Executive",
                  department: "Accounts and Finance",
                  empCode: "37345",
                },
              },
            ],
          },
          {
            name: "John Doe5 (37369)",
            attributes: {
              designation: "Sr. Account Executive",
              department: "Accounts and Finance",
              empCode: "37369",
            },
          },
        ],
      },
      {
        name: "John Doe2 (36970)",
        attributes: {
          designation: "CA",
          department: "Accounts and Finance",
          empCode: "36970",
        },
      },
    ],
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "600px" }}>
      <Tree
        data={employeeData}
        orientation="vertical"
        pathFunc="step"
        translate={{ x: dimensions.width / 2, y: 80 }}
        renderCustomNodeElement={(rd3tProps) => (
          <CustomNode nodeDatum={rd3tProps.nodeDatum} toggleNode={rd3tProps.toggleNode} />
        )}
        separation={{ siblings: 2, nonSiblings: 2 }}
        nodeSize={{ x: 240, y: 120 }}
      />
    </div>
  )
}
